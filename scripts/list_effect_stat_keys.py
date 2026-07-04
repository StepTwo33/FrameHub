import re
from collections import Counter

t = open("src/data/arcane-effects.ts", encoding="utf-8").read()
stats = re.findall(r'"stat": "([^"]+)"', t)
print(f"Unique stats: {len(set(stats))}")
for k, v in Counter(stats).most_common():
    print(f"  {k}: {v}")
