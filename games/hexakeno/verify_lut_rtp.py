import csv, os

LUT_DIR = os.path.join("library", "lookup_tables")
results = []

for mode in ["classic", "low", "medium", "high"]:
    fname = os.path.join(LUT_DIR, f"lookUpTable_{mode}.csv")
    total_win = 0
    total_cost = 0
    count = 0
    with open(fname) as f:
        for row in csv.reader(f):
            cost = int(row[1])
            win = int(row[2])
            total_win += win
            total_cost += cost
            count += 1
    rtp = total_win / total_cost * 100
    line = f"{mode}: count={count}, total_win={total_win}, total_cost={total_cost}, RTP={rtp:.4f}%"
    results.append(line)
    print(line)

with open("rtp_verification_results.txt", "w") as f:
    f.write("\n".join(results))
