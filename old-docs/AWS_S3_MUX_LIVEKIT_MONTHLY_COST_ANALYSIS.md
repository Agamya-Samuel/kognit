# AWS S3 + Mux + LiveKit — Monthly Cost Analysis

> **Scenario:** 30 hours of video lectures, watched 1,000 times
> **Date:** 7th May, 2026
> **All prices in USD**

---

## 1. Architecture Recap: Why Each Service Exists

| Service | Purpose | Charged For |
|---|---|---|
| **AWS S3** | Raw video ingestion (direct upload), LiveKit recording storage | Storage GB/month, data transfer out |
| **Mux** | Transcoding to HLS, adaptive bitrate streaming, signed playback URLs | Encoding (min), storage (min/month), delivery (min) |
| **LiveKit** | Live class video/audio streaming (real-time WebRTC) | Connection minutes, downstream bandwidth (GB) |

**The Pipeline:**
```
Instructor uploads → S3 (raw, ~72 GB for 30 hrs @ 1080p)
  → Mux downloads from S3 → transcodes to HLS
  → Students stream from Mux (signed URLs)

Live class → LiveKit (real-time streaming)
  → LiveKit records to S3
  → NestJS ingests S3 recording into Mux
  → Replay available via Mux
```

---

## 2. Assumptions

| Parameter | Value |
|---|---|
| Total video content | 30 hours = 1,800 minutes |
| Lectures | 30 lectures × 1 hour each |
| Video quality | 1080p (5 Mbps average bitrate) |
| Raw upload size | ~72 GB (25 min/GB at 1080p) |
| Average watch completion | 50% (30 min per lecture view) |
| Free AWS credits | $200 (new account, 12 months) |
| Mux plan | Free tier → Pay-as-you-go ($20/mo credit) |
| LiveKit plan | Build (free) → Ship ($50/mo) |

---

## 3. AWS S3 Pricing Breakdown

### Pricing Reference
| Component | Rate |
|---|---|
| Storage (S3 Standard) | $0.023/GB/month |
| Data transfer IN | FREE |
| Data transfer OUT (first 100 GB/mo) | FREE |
| Data transfer OUT (100 GB – 10 TB) | $0.09/GB |
| S3 → CloudFront (same region) | FREE |

### Monthly Cost
| Component | Calculation | Cost |
|---|---|---|
| Storage (raw uploads) | 72 GB × $0.023 | **$1.66** |
| Upload transfer (in) | 72 GB from internet | FREE |
| Mux ingestion transfer | 72 GB S3 → Mux (internet egress) | FREE (under 100 GB) |
| LiveKit recordings | ~10 GB × $0.023 | **$0.23** |
| API requests | ~50 PUT + ~200 GET | FREE (under free tier) |
| **S3 Total** | | **~$1.89/month** |

> **Optimization:** If you delete raw uploads from S3 after Mux successfully ingests them, S3 cost drops to **~$0.23/month** (only LiveKit recordings stored).

---

## 4. Mux Pricing Breakdown

### Pricing Reference (Basic Quality, 720p)
| Component | Rate |
|---|---|
| File Input (encoding) | **FREE** (Basic quality) |
| Storage | $0.0024/minute/month |
| Delivery (first 100K min/mo) | **FREE** |
| Delivery (100K – 600K) | $0.0008/min |
| Delivery (600K – 1.1M) | $0.00076/min |
| Monthly credit (PAYG) | **$20/month** |

### Pricing Reference (1080p)
| Component | Rate |
|---|---|
| Storage | $0.003/minute/month |
| Delivery (first 100K min/mo) | **FREE** |
| Delivery (100K – 600K) | $0.001/min |
| Delivery (600K – 1.1M) | $0.00095/min |

---

### Scenario A: Realistic Early Stage (1,000 total views/month)

**Assumption:** 1,000 video views total across all lectures, 50% avg completion

| Component | Calculation | Cost |
|---|---|---|
| Encoding (Basic) | 1,800 min × FREE | **$0.00** |
| Storage | 1,800 min × $0.0024 | **$4.32** |
| Delivery | 1,000 views × 30 min avg = 30,000 min | **$0.00** (under 100K free) |
| Less: Monthly credit | -$20.00 | **-$20.00** |
| **Mux Total** | | **$0.00/month** |

> **Result:** Entirely covered by free tier + $20 credit. You pay **nothing**.

---

### Scenario B: High Engagement (each lecture watched 1,000 times)

**Assumption:** 30 lectures × 1,000 views = 30,000 views total, 50% avg completion

| Component | Calculation | Cost |
|---|---|---|
| Encoding (Basic) | 1,800 min × FREE | **$0.00** |
| Storage | 1,800 min × $0.0024 | **$4.32** |
| Delivery total | 30,000 views × 30 min = **900,000 min** | |
| Delivery (first 100K) | FREE | $0.00 |
| Delivery (100K – 600K) | 500,000 × $0.0008 | $400.00 |
| Delivery (600K – 900K) | 300,000 × $0.00076 | $228.00 |
| Subtotal delivery | | **$628.00** |
| Less: Monthly credit | -$20.00 | |
| **Mux Total** | | **$612.32/month** |

---

### Scenario C: Moderate Growth (5,000 total views/month)

**Assumption:** 5,000 views total, 50% avg completion

| Component | Calculation | Cost |
|---|---|---|
| Encoding | FREE | **$0.00** |
| Storage | 1,800 min × $0.0024 | **$4.32** |
| Delivery | 5,000 × 30 min = 150,000 min | |
| Delivery (first 100K) | FREE | $0.00 |
| Delivery (remaining 50K) | 50,000 × $0.0008 | $40.00 |
| Less: Monthly credit | -$20.00 | |
| **Mux Total** | | **$24.32/month** |

---

### Mux Cost Scaling Table (at 720p Basic Quality)

| Monthly Views | Delivery Minutes | Delivery Cost | After $20 Credit | Total Mux Cost |
|---|---|---|---|---|
| 1,000 | 30,000 | $0.00 | $0.00 | **$4.32** (storage only) |
| 2,000 | 60,000 | $0.00 | $0.00 | **$4.32** |
| 3,334 | 100,000 | $0.00 | $0.00 | **$4.32** |
| 5,000 | 150,000 | $40.00 | $20.00 | **$24.32** |
| 10,000 | 300,000 | $160.00 | $140.00 | **$164.32** |
| 20,000 | 600,000 | $400.00 | $380.00 | **$384.32** |
| 30,000 | 900,000 | $628.00 | $608.00 | **$612.32** |

> **Key insight:** Mux is essentially free until you cross ~3,334 views/month (100K delivery minutes). After that, costs scale linearly at ~$0.0008/min (720p) or ~$0.001/min (1080p).

---

## 5. LiveKit Pricing Breakdown

### Pricing Reference
| Component | Build (Free) | Ship ($50/mo) |
|---|---|---|
| Concurrent participants | 100 | 1,000 |
| Connection minutes/month | 5,000 free | 150,000 free |
| Downstream bandwidth | 50 GB free | 250 GB free |
| Connection minutes (overage) | $0.0005/min | $0.00045/min |
| Bandwidth (overage) | $0.12/GB | $0.12/GB |

### Assumptions for Live Classes
| Parameter | Value |
|---|---|
| Live sessions/month | 30 sessions × 1 hour |
| Participants per session | 50 students + 1 instructor = 51 |
| Downstream per participant | ~1.5 Mbps (720p) |
| Upstream (instructor) | 2 Mbps (FREE — upstream is unmetered) |

### Bandwidth Calculation
```
Per session per student: 1.5 Mbps × 3,600 sec = 5,400 Mb = 675 MB
Per session (50 students): 675 MB × 50 = 33.75 GB
30 sessions/month: 33.75 GB × 30 = ~1,012 GB total downstream
```

### Connection Minutes Calculation
```
30 sessions × 60 min × 51 participants = 91,800 connection minutes
```

### Cost on Build Plan (Free)
| Component | Calculation | Cost |
|---|---|---|
| Connection minutes | 91,800 - 5,000 free = 86,800 × $0.0005 | **$43.40** |
| Bandwidth | 1,012 - 50 free = 962 GB × $0.12 | **$115.44** |
| **LiveKit Total** | | **$158.84/month** |

### Cost on Ship Plan ($50/mo)
| Component | Calculation | Cost |
|---|---|---|
| Plan base | | **$50.00** |
| Connection minutes | 91,800 (under 150K free) | $0.00 |
| Bandwidth | 1,012 - 250 free = 762 GB × $0.12 | **$91.44** |
| **LiveKit Total** | | **$141.44/month** |

> **Recommendation:** Ship plan is slightly cheaper at scale. The $50/mo covers all connection minutes, leaving only bandwidth overage.

---

## 6. Combined Monthly Cost Summary

### Scenario A: Early Stage (1,000 total views, 30 live sessions)

| Service | Monthly Cost |
|---|---|
| AWS S3 | $1.89 |
| Mux | $0.00 (free tier + credits) |
| LiveKit (Build plan) | $158.84 |
| **Total** | **~$160.73/month** |

> **Note:** LiveKit is the dominant cost because live streaming bandwidth is expensive. Mux is free at this scale.

### Scenario B: High Engagement (30,000 total views, 30 live sessions)

| Service | Monthly Cost |
|---|---|
| AWS S3 | $1.89 |
| Mux (720p Basic) | $612.32 |
| LiveKit (Ship plan) | $141.44 |
| **Total** | **~$755.65/month** |

### Scenario C: Moderate Growth (5,000 views, 30 live sessions)

| Service | Monthly Cost |
|---|---|
| AWS S3 | $1.89 |
| Mux (720p Basic) | $24.32 |
| LiveKit (Ship plan) | $141.44 |
| **Total** | **~$167.65/month** |

---

## 7. Free Tiers & Credits Summary

### AWS
| Benefit | Value | Duration |
|---|---|---|
| Free Tier credits | $200 | 12 months from account creation |
| S3 storage | 5 GB free | 12 months |
| Data transfer out | 100 GB/month free | Always |
| **Effective Month 1 cost** | **$0** (covered by $200 credit) | |

### Mux
| Benefit | Value | Duration |
|---|---|---|
| File encoding (Basic) | FREE | Always |
| Delivery | 100,000 min/month FREE | Always |
| PAYG monthly credit | $20/month | Always (with credit card) |
| Free plan storage | Up to 10 videos | Always |
| **Effective Month 1 cost** | **$0** (under free tier) | |

### LiveKit
| Benefit | Value | Duration |
|---|---|---|
| Build plan | FREE (5K conn min, 50 GB bandwidth) | Always |
| **Month 1** | Free tier covers testing | |
| **Month 2+** | Upgrade to Ship ($50/mo) for production | |

---

## 8. Cost Optimization Recommendations

### Immediate (Month 1)
1. **Use Mux Basic quality** — encoding is FREE, storage cheapest at $0.0024/min
2. **Delete S3 originals after Mux ingestion** — saves $1.50/month, negligible
3. **Enable Mux Automatic Cold Storage** — up to 60% discount on rarely-watched assets
4. **Start with LiveKit Build (free)** — fine for beta testing with limited sessions
5. **Use AWS $200 credit** — covers all AWS costs for first few months

### Short-term (Months 2–3)
1. **Set `max_resolution=720p` on playback URLs** — cuts delivery cost by 20%+
2. **Use `preload="none"` on video player** — prevents buffering charges for non-watchers
3. **Lazy-load video player** — only loads when scrolled into view
4. **Upgrade to LiveKit Ship plan** at $50/mo once live sessions exceed free tier

### Medium-term (Months 4–6)
1. **Mux Launch plan ($20/mo for $100 credit)** — better value than PAYG once spending >$40/mo
2. **Monitor delivery per video** — delete underperforming content from Mux to reduce storage
3. **Consider CloudFront in front of S3** — S3→CloudFront transfer is FREE, CloudFront→internet is cheaper than S3→internet ($0.02–0.06/GB vs $0.09/GB)
4. **Negotiate with Mux** — at scale ($1,000+/mo), custom enterprise plans available

### Long-term (6+ months, high scale)
1. **Evaluate self-hosted transcoding** (FFmpeg + HLS) — Mux becomes expensive at 10M+ delivery minutes
2. **Cloudflare Stream or Bunny.net** — cheaper alternatives at massive scale
3. **Self-host LiveKit** on EC2 — open-source, save $140–160/month on bandwidth

---

## 9. Bottom Line for Your Scenario

For **30 hours of video lectures, 1,000 total views/month, 30 live sessions**:

| Phase | Monthly Cost |
|---|---|
| **Month 1 (free credits)** | **$0 – $20** |
| **Months 2–3 (beta)** | **~$160/month** |
| **Months 4–6 (growth)** | **~$170–200/month** |

The dominant cost is **LiveKit bandwidth** ($140–160/mo), not Mux. Mux is essentially free until you cross ~3,334 views/month.

> **Key takeaway:** Your infrastructure costs will be well under $200/month for the first 6 months at this scale. Live streaming bandwidth is your primary cost driver, not video storage or on-demand delivery.

---

## 10. Cost Per Student Analysis

| Metric | Value |
|---|---|
| Monthly infrastructure cost | ~$160 |
| If 100 paying students | $1.60/student/month |
| If 500 paying students | $0.32/student/month |
| If 1,000 paying students | $0.16/student/month |

At a course price of ₹499–₹4,999 (~$6–$60), the infrastructure cost per student is **negligible** (2–25% of revenue at lowest price tier).
