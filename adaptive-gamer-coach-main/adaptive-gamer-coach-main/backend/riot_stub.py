"""
PHASE 2 SCAFFOLD — Riot API Integration
Not active in MVP. Wire into main.py when Phase 2 begins.

Riot API Notes:
- Dev API key: 20 req/sec, 100 req/2min (sufficient for demo)
- Production key: requires Riot approval + app submission
- PUUID lookup: no OAuth needed for public data (GET by Riot ID + tag)
- Full match history: requires PUUID from account lookup
- RSO (OAuth): only needed if player must authenticate themselves
  For demo: dev key can fetch any player's public match data by PUUID

Key finding: completionState == "Surrendered" in match data
  = direct rage-quit signal (better than any proxy feature in our dataset)
  Cross-reference: player KDA in surrendered match vs 30-day average
  → High deaths + surrendered + loss streak = very high confidence rage signal

Endpoints we'll use in Phase 2:
  1. GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
     → Returns: puuid, gameName, tagLine
  2. GET /val/match/v1/matchlists/by-puuid/{puuid}
     → Returns: list of matchIds (last 20 by default)
  3. GET /val/match/v1/matches/{matchId}
     → Returns: full match with completionState, players, rounds

Feature mapping from Riot API → our model features:
  daily_gaming_hours    = sum(gameLengthMillis) per day / 3600000
  weekly_sessions       = count of matches in last 7 days
  night_gaming_ratio    = count(matches where startTime.hour >= 22 or < 4) / total
  stress_level          = derived from loss_streak (3 losses → stress 7, 5+ → stress 9)
  aggression_score      = deaths_per_round spike index (above personal avg)
  rage_quit signal      = completionState == "Surrendered" AND kda < avg_kda * 0.5

Features that CANNOT come from Riot API (always self-reported):
  sleep_hours, anxiety_score, depression_score, loneliness_score,
  happiness_score, social_interaction_score, toxic_exposure (chat not exposed)
"""

import os
import httpx
from typing import Optional, Dict, List
from datetime import datetime, timezone

RIOT_API_KEY = os.getenv("RIOT_API_KEY", "")
RIOT_BASE_AMERICAS = "https://americas.api.riotgames.com"
RIOT_BASE_NA = "https://na.api.riotgames.com"

HEADERS = {"X-Riot-Token": RIOT_API_KEY}


async def get_puuid_by_riot_id(game_name: str, tag_line: str) -> Optional[str]:
    """Step 1: Convert Riot ID (name#tag) to PUUID."""
    url = f"{RIOT_BASE_AMERICAS}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=HEADERS)
        resp.raise_for_status()
        return resp.json().get("puuid")


async def get_match_list(puuid: str, count: int = 20) -> List[str]:
    """Step 2: Get recent match IDs."""
    url = f"{RIOT_BASE_AMERICAS}/val/match/v1/matchlists/by-puuid/{puuid}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=HEADERS)
        resp.raise_for_status()
        data = resp.json()
        return [m["matchId"] for m in data.get("history", [])[:count]]


async def get_match_details(match_id: str) -> Dict:
    """Step 3: Get full match details."""
    url = f"{RIOT_BASE_AMERICAS}/val/match/v1/matches/{match_id}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=HEADERS)
        resp.raise_for_status()
        return resp.json()


def compute_features_from_matches(puuid: str, matches: List[Dict]) -> Dict:
    """
    Compute model-ready features from a list of match detail objects.
    Returns dict with auto-computable features + flags for self-report fields.
    """
    if not matches:
        return {}

    total_duration_ms = 0
    game_dates = []
    night_count = 0
    surrendered_count = 0
    kda_list = []

    for match in matches:
        # Duration
        duration = match.get("matchInfo", {}).get("gameLengthMillis", 0)
        total_duration_ms += duration

        # Start time
        start_ms = match.get("matchInfo", {}).get("gameStartMillis", 0)
        if start_ms:
            dt = datetime.fromtimestamp(start_ms / 1000, tz=timezone.utc)
            game_dates.append(dt)
            if dt.hour >= 22 or dt.hour < 4:
                night_count += 1

        # Surrender detection
        completion = match.get("matchInfo", {}).get("completionState", "")
        if completion == "Surrendered":
            surrendered_count += 1

        # KDA for this player
        for player in match.get("players", []):
            if player.get("puuid") == puuid:
                stats = player.get("stats", {})
                kills = stats.get("kills", 0)
                deaths = max(stats.get("deaths", 1), 1)
                assists = stats.get("assists", 0)
                kda_list.append((kills + assists) / deaths)
                break

    # Compute features
    n_matches = len(matches)
    avg_daily_hours = (total_duration_ms / 3_600_000) / 7  # assume 7-day window
    night_ratio = night_count / n_matches if n_matches else 0
    avg_kda = sum(kda_list) / len(kda_list) if kda_list else 1

    # Loss streak proxy for stress (simple: count consecutive losses at end)
    # Note: would need win/loss per match for this — simplified here
    surrender_ratio = surrendered_count / n_matches if n_matches else 0

    return {
        "auto_computed": {
            "daily_gaming_hours": round(avg_daily_hours, 2),
            "weekly_sessions": n_matches,  # matches in the fetched window
            "night_gaming_ratio": round(night_ratio, 2),
            "aggression_score": round(min(10, surrender_ratio * 10 * 2), 1),
        },
        "self_report_required": [
            "stress_level", "anxiety_score", "sleep_hours",
            "loneliness_score", "social_interaction_score",
            "happiness_score", "depression_score", "toxic_exposure",
        ],
        "riot_insights": {
            "total_matches_analyzed": n_matches,
            "surrendered_matches": surrendered_count,
            "surrender_rate": round(surrender_ratio, 2),
            "average_kda": round(avg_kda, 2),
            "night_gaming_sessions": night_count,
        }
    }


# To wire into main.py, add this endpoint:
"""
@app.post("/fetch-player")
async def fetch_player_data(riot_id: str, tag: str):
    try:
        puuid = await get_puuid_by_riot_id(riot_id, tag)
        match_ids = await get_match_list(puuid, count=20)
        matches = []
        for mid in match_ids[:10]:  # limit to 10 for rate limit safety
            try:
                m = await get_match_details(mid)
                matches.append(m)
                await asyncio.sleep(0.1)  # 10 req/sec to stay under limit
            except Exception:
                pass
        features = compute_features_from_matches(puuid, matches)
        return {"puuid": puuid, "features": features}
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
"""
