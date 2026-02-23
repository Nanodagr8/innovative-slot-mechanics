import random
import hmac
import hashlib
import json
import time
from .config import OUTCOME_PROBS, PAYOUT_MULTIPLIERS, BASE_RTP

class UranusOceanEngine:
    def __init__(self, secret_key="SUPER_SECRET_KEY"):
        self.secret_key = secret_key

    def resolve_burst(self, player_id, bet_per_shot, shots_count):
        """
        Resolves a burst of N shots. 
        Each shot is an independent wager.
        """
        results = []
        total_payout = 0.0

        for i in range(shots_count):
            outcome_data = self._sample_outcome()
            payout = outcome_data["multiplier"] * bet_per_shot
            
            results.append({
                "shot_idx": i + 1,
                "type": outcome_data["type"],
                "payout": round(payout, 2),
                "multiplier": outcome_data["multiplier"]
            })
            total_payout += payout

        # Create signed ticket
        ticket = {
            "ticket_id": f"T-{int(time.time())}-{random.randint(1000,9999)}",
            "player_id": player_id,
            "bet_per_shot": bet_per_shot,
            "shots": shots_count,
            "outcomes": results,
            "total_payout": round(total_payout, 2),
            "issued_at": int(time.time())
        }

        ticket["signature"] = self._sign_ticket(ticket)
        return ticket

    def _sample_outcome(self):
        r = random.random()
        cumulative = 0.0
        for outcome, prob in OUTCOME_PROBS.items():
            cumulative += prob
            if r <= cumulative:
                return {
                    "type": outcome,
                    "multiplier": PAYOUT_MULTIPLIERS[outcome]
                }
        return {"type": "MISS", "multiplier": 0.0}

    def _sign_ticket(self, ticket):
        # We don't sign the signature itself
        payload = {k: v for k, v in ticket.items() if k != "signature"}
        msg = json.dumps(payload, sort_keys=True).encode()
        return hmac.new(self.secret_key.encode(), msg, hashlib.sha256).hexdigest()

    def verify_ticket(self, ticket):
        stored_sig = ticket.get("signature")
        if not stored_sig:
            return False
        return hmac.compare_digest(stored_sig, self._sign_ticket(ticket))

    def simulate_rtp(self, iterations=1_000_000):
        total_bet = iterations
        total_win = 0.0
        
        counts = {k: 0 for k in OUTCOME_PROBS.keys()}
        
        for _ in range(iterations):
            outcome = self._sample_outcome()
            total_win += outcome["multiplier"]
            counts[outcome["type"]] += 1
            
        return {
            "actual_rtp": round(total_win / total_bet, 5),
            "target_rtp": BASE_RTP,
            "counts": counts
        }

if __name__ == "__main__":
    engine = UranusOceanEngine()
    print("Running Simulation...")
    sim = engine.simulate_rtp(1_000_000)
    print(f"RTP: {sim['actual_rtp']} (Target: {sim['target_rtp']})")
    print(f"Stats: {sim['counts']}")
