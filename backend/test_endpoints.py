import requests
import pandas as pd
import io

BASE_URL = "http://127.0.0.1:8003"

def test_flow():
    # 1. Create a dummy CSV
    df = pd.DataFrame({
        'A': [1, 2, 3, 4, 5],
        'B': [2, 4, 6, 8, 10], # Perfect correlation
        'C': [5, 4, 3, 2, 1], # Perfect negative correlation
        'D': ['x', 'y', 'x', 'y', 'x']
    })
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_content = csv_buffer.getvalue()

    # 2. Upload
    files = {'file': ('test.csv', csv_content, 'text/csv')}
    print("Uploading dataset...")
    res = requests.post(f"{BASE_URL}/data/upload", files=files)
    if res.status_code != 200:
        print("Upload failed:", res.text)
        return
    data = res.json()
    dataset_id = data['dataset_id']
    print(f"Dataset ID: {dataset_id}")

    # 3. Profile (Check correlations)
    print("Fetching profile...")
    res = requests.get(f"{BASE_URL}/data/profile/{dataset_id}")
    profile = res.json()
    if "correlations" in profile:
        print("✅ Correlations found in profile")
        print(profile["correlations"])
    else:
        print("❌ Correlations missing in profile")

    # 4. Scatter Data
    print("Fetching scatter data (A vs B)...")
    res = requests.get(f"{BASE_URL}/data/scatter/{dataset_id}?x=A&y=B")
    if res.status_code == 200:
        scatter_data = res.json()
        print(f"✅ Scatter data received: {len(scatter_data)} points")
        print(scatter_data[0])
    else:
        print("❌ Scatter data failed:", res.text)

    # 5. Story
    print("Fetching story...")
    res = requests.get(f"{BASE_URL}/insight/story/{dataset_id}")
    if res.status_code == 200:
        story_res = res.json()
        if "story" in story_res or "sections" in story_res:
            print("✅ Story generated successfully")
            # print(story_res)
        else:
            print("❌ Story response structure invalid:", story_res)
    else:
        print("❌ Story generation failed:", res.text)

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"Test failed: {e}")
