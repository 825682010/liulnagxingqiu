#!/usr/bin/env python3
# 同步脚本：从飞书多维表格拉取数据并生成 data.json

import os
import json
import requests

# --- 从 GitHub Secrets 读取敏感信息（安全） ---
APP_ID = os.environ["FEISHU_APP_ID"]
APP_SECRET = os.environ["FEISHU_APP_SECRET"]
BASE_TOKEN = os.environ["FEISHU_BASE_TOKEN"]
TABLE_ID = os.environ["FEISHU_TABLE_ID"]

# --- 1. 获取 tenant_access_token ---
print("🔑 获取 tenant_access_token ...")
r = requests.post(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    json={"app_id": APP_ID, "app_secret": APP_SECRET}
)
r.raise_for_status()
token_data = r.json()
if token_data.get("code") != 0:
    raise Exception(f"获取 token 失败: {token_data}")
token = token_data["tenant_access_token"]
print("✅ token 获取成功")

# --- 2. 分页读取表格全部记录 ---
print("📋 开始读取多维表格记录...")
all_records = []
page_token = None
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

while True:
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{BASE_TOKEN}/tables/{TABLE_ID}/records"
    params = {"page_size": 100}
    if page_token:
        params["page_token"] = page_token
    r = requests.get(url, headers=headers, params=params)
    r.raise_for_status()
    data = r.json()
    if data.get("code") != 0:
        raise Exception(f"读取记录失败: {data}")
    records = data.get("data", {}).get("items", [])
    all_records.extend(records)
    print(f"   已读取 {len(all_records)} 条记录...")
    if not data.get("data", {}).get("has_more", False):
        break
    page_token = data["data"].get("page_token")

print(f"✅ 共读取 {len(all_records)} 条记录")

# --- 3. 处理附件（如嘉宾照片），将 file_token 转为可用图片 URL ---
print("🖼️ 处理附件图片...")
# 先收集所有 file_token
file_tokens = set()
for record in all_records:
    fields = record.get("fields", {})
    # 假设图片字段名为“首图”（请根据实际表格字段名调整）
    img_field = fields.get("首图")
    if isinstance(img_field, list):
        for item in img_field:
            if isinstance(item, dict) and "file_token" in item:
                file_tokens.add(item["file_token"])

# 批量获取附件下载链接
file_url_map = {}
for ft in file_tokens:
    try:
        r = requests.get(
            f"https://open.feishu.cn/open-apis/drive/v1/medias/{ft}/download",
            headers=headers
        )
        if r.status_code == 200:
            download_data = r.json()
            if download_data.get("code") == 0 and "file_url" in download_data.get("data", {}):
                file_url_map[ft] = download_data["data"]["file_url"]
        else:
            print(f"   获取附件 {ft} 失败，状态码: {r.status_code}")
    except Exception as e:
        print(f"   获取附件 {ft} 异常: {e}")

# 替换记录中的附件字段为图片 URL
for record in all_records:
    fields = record.get("fields", {})
    img_field = fields.get("首图")
    if isinstance(img_field, list):
        new_imgs = []
        for item in img_field:
            if isinstance(item, dict) and "file_token" in item:
                ft = item["file_token"]
                if ft in file_url_map:
                    new_imgs.append(file_url_map[ft])
                else:
                    new_imgs.append(item.get("name", ""))  # 兜底保留文件名
            else:
                new_imgs.append(item)
        fields["首图"] = new_imgs  # 替换为图片 URL 列表

# --- 4. 生成最终数据文件 ---
output = []
for record in all_records:
    output.append({
        "record_id": record.get("record_id"),
        "fields": record.get("fields", {})
    })

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ 数据已写入 data.json，共 {len(output)} 条")