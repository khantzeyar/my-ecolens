import pandas as pd
import os

# 项目根目录
BASE_DIR = "/Users/liyinbo/Documents/GitHub/my-ecolens/src/app/data"

# 读取州级预测数据
state_csv = os.path.join(BASE_DIR, "state_tree_loss_predictions.csv")
state_json = os.path.join(BASE_DIR, "state_tree_loss_predictions.json")

df1 = pd.read_csv(state_csv)
df1.to_json(state_json, orient="records", indent=2)

# 读取区县预测数据
district_csv = os.path.join(BASE_DIR, "district_tree_loss_predictions.csv")
district_json = os.path.join(BASE_DIR, "district_tree_loss_predictions.json")

df2 = pd.read_csv(district_csv)
df2.to_json(district_json, orient="records", indent=2)

print("✅ 已生成 JSON 文件：")
print(f"- {state_json}")
print(f"- {district_json}")
