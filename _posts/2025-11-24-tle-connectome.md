---
layout: project
title: 碩士研究-大腦分析
date: 2025-11-24
description: 用 MRI 資料重建大腦網路，找出癲癇與正常人的腦結構差異
githubUrl: 
liveUrl: 
spend: 2 years
tags: [Neuroscience, Structural Connectome, Diffusion MRI, Tractography, COMMIT2, Graph Theory, Network-Based Statistics, NBS, ANCOVA, FDR Correction, Permutation Testing, GPU Computing, Python, CuPy, NumPy, bctpy, HCPex Atlas]
image: /assets/images/master-brain-3d.gif
math: false
---

---

![3D腦圖預覽](/assets/images/master-brain-3d.gif)

---

## 什麼是腦連結體？

把大腦想像成一座城市，腦區是不同的行政區，在中間連接它們的白質纖維束是道路。

腦連結體（Connectome） 就是這座城市的完整交通地圖。
我們透過擴散 MRI 影像（dMRI）可以偵測水分子在白質纖維中的擴散方向，基於此，就能進一步推算出每條道路的走向與粗細。

在這個研究中，每個節點（node）代表一個腦區；每條邊（edge）代表兩個腦區之間白質連接的強度。
而我們的研究對象主要是顳葉癲癇（TLE）患者，是臨床上最大宗的難治型癲癇類型。也因此，探討其與正常人的差異，試圖找出源頭、傳播路徑、受影響區域等等，就變成很重要的問題。

這份研究使用臨床 MRI 影像，運用 COMMIT2 處理技術減少重建誤差後，找出患者與正常人腦連結體中各個區域的連結差異，試圖為目前遇到臨床困境提出可能的解釋方法，並提供之後改善癲癇偵測或手術位置的方向。

---

## 我建了什麼

從原始擴散影像到統計推論的完整分析流水線。

輸入是每位受試者的 MRI 掃描，輸出是一張加權連接矩陣，每個格子代表兩個腦區之間白質連接的強度。由於採用比較細緻的大腦圖譜，一名患者約有十萬個格子待分析。

在這張矩陣上，我跑了三個層次的分析：
全腦整體指標的組間差異、全腦腦區各自的節點指標比較、以及子網路的邊分析。

分析結果在三個空間層次均找到顯著差異。
完整結果因時程暫不公開，有興趣歡迎直接聯繫，或可至臺灣碩博士論文網找尋舊版本研究。

---

## 技術


![分析流程圖](/assets/images/master-brain-pipeline.svg)


### 前處理核心

**COMMIT2 （影像前處理）**
一般的擴散影像追蹤方法容易產生假陽性結果。COMMIT2 透過凸優化為每條纖維束賦予微結構權重，可以得到研究當下相比於其他技術，最貼近實際腦組織的影像結果。

**HCPex Atlas（標準腦圖譜）**
涵蓋皮質與皮質下結構，包含較深部的核區，無論是腦區區分的細緻度還是深入程度，相比於其他圖譜都較符合本次研究的需求。導入處理程序後，每位受試者會產出一張加權連接矩陣。

---

### 統計分析

**全局層**

Rank-based ANCOVA，控制年齡與性別，
比較兩組的全腦平均連接強度與全局效率。

**節點層**

全腦腦區 × 圖論指標的分析：

| 指標 | 意義 |
|------|------|
| Strength | 節點連接總強度 |
| Clustering Coefficient | 鄰近節點間的連接密度 |
| Nodal Efficiency | 透過該節點傳遞資訊的效率 |
| Betweenness Centrality | 最短路徑經過該節點的比例 |
| Eigenvector Centrality | 考慮相鄰節點重要性的影響力指標 |

並使用 FDR 校正。

**邊層：NBS（Network-Based Statistics）**

因數量龐大，不針對單一條邊做多重比較校正，以避免結果誤差過大。改以連通子網路的整體統計量做排列測試（Permutation Testing）。

---

### GPU 加速

NBS 需要 10,000 次排列測試，每次重新計算所有邊的統計量。近十萬條邊的統計總量非常龐大，單用cpu的負載過重。
因此，我用 **CuPy** 平行計算全部統計量，再重建成完整矩陣。此方法進行全腦 NBS 兼顧了統計可信度、以及可負荷的計算量。

---

### 使用技術及工具


- Python: 主要開發語言
- NumPy: 矩陣運算、連接矩陣處理
- statsmodels: ANCOVA、線性模型
- pingouin: Spearman 偏相關分析
- bctpy: 圖論指標計算
- CuPy: GPU 加速矩陣運算（NVIDIA CUDA）
- Plotly: 互動式 3D 腦圖視覺化

---

## 總結

**經過碩士訓練後，我能做什麼？**
大規模多維度（醫療）資料的清理與建模、統計分析流水線的設計與實作、GPU 加速運算、資料視覺化（包含互動式 3D）。