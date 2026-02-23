import multiprocessing
import time
from typing import List, Dict
from keno_engine import HexakenoEngine
from keno_config import PAYTABLE_CLASSIC, PAYTABLE_LOW, PAYTABLE_MEDIUM, PAYTABLE_HIGH

def simulate_hits(args):
    """Run a batch of simulations."""
    risk, count, seed_offset = args
    engine = HexakenoEngine()
    total_return = 0.0
    
    # We use a fixed pick set for consistency, but in reality picks don't affect RTP in Keno 
    # (assuming fair RNG), only the count of picks matters.
    # We verify pick-10 strategies as they are the most complex.
    # You could randomize this.
    player_picks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    
    for i in range(count):
        # We don't need to actually "play" the round with seeds for raw RTP checking 
        # if we just trust the engine's draw logic, but engine uses seeds.
        # We'll just let the engine handle it.
        # To avoid seed collisions in multiprocess, we could manual set seeds, 
        # but the engine initializes with random seeds.
        
        result = engine.play_round(player_picks=player_picks, bet_amount=1.0, risk=risk, use_superball=False)
        total_return += result.final_payout
        
    return total_return

def verify_risk_profile(risk_name: str, num_sims: int = 1_000_000):
    """Verify RTP for a specific risk profile."""
    print(f"--- Verifying {risk_name.upper()} (Sims: {num_sims}) ---")
    
    num_processes = multiprocessing.cpu_count()
    chunk_size = num_sims // num_processes
    
    pool = multiprocessing.Pool(processes=num_processes)
    
    # Create chunks
    tasks = [(risk_name, chunk_size, i * chunk_size) for i in range(num_processes)]
    
    start_time = time.time()
    results = pool.map(simulate_hits, tasks)
    end_time = time.time()
    
    total_payout = sum(results)
    
    rtp = (total_payout / num_sims) * 100
    duration = end_time - start_time
    
    print(f"RTP: {rtp:.4f}% | Time: {duration:.2f}s")
    
    pool.close()
    pool.join()
    
    # Verification Rule: 90% - 96.5%
    if 90.0 <= rtp <= 96.5:
        print("PASS")
    else:
        print(f"FAIL (Target: 90-96.5%)")
    
    return rtp

if __name__ == "__main__":
    print("Starting Hexa Keno RTP Verification...")
    print("Using Multiprocessing")
    
    profiles = ['classic', 'low', 'medium', 'high']
    # 2.5M per profile = 10M total
    sims_per_profile = 2_500_000 
    
    results = {}
    
    for p in profiles:
        results[p] = verify_risk_profile(p, sims_per_profile)
        
    print("\n=== FINAL SUMMARY ===")
    all_pass = True
    for p, rtp in results.items():
        status = "PASS" if 90.0 <= rtp <= 96.5 else "FAIL"
        if status == "FAIL": all_pass = False
        print(f"{p.upper()}: {rtp:.4f}% [{status}]")
        
    if all_pass:
        print("\nGLOBAL VERIFICATION PASSED")
        # Exit with 0 for CI/CD
        exit(0)
    else:
        print("\nGLOBAL VERIFICATION FAILED")
        exit(1)
