# AWS Checklist - 15 Minute Step-by-Step (Low Cost, Must-Have Only)

## Purpose
Use this checklist to keep the project demo-ready for recruiters/friends while minimizing AWS cost.

## Scope
- Personal portfolio/demo usage
- Keep current architecture (Frontend: S3 + CloudFront, Backend: ECS Fargate + ALB, DB: PostgreSQL)
- Apply only high-impact, low-effort, low-cost settings

---

## 0) Prep (1 minute)
Have these ready:
- AWS Console access
- Project region (same region as ECS/ALB/Secrets)
- Alert email address

---

## 1) Create budget alerts (2 minutes) [MUST]
**Goal:** Avoid billing surprises.

1. Open **AWS Console -> Billing and Cost Management -> Budgets**.
2. Click **Create budget** -> **Cost budget**.
3. Budget amount:
   - Start with **$20/month** (or your preferred cap).
4. Add alerts:
   - **80%** threshold (email)
   - **100%** threshold (email)
5. Save budget.

**Done when:** You receive a budget alert test/confirmation email.

---

## 2) Set CloudWatch log retention (2 minutes) [MUST]
**Goal:** Reduce ongoing log storage cost.

1. Open **CloudWatch -> Log groups**.
2. Find ECS app log group (example: `/ecs/healthcare-backend`).
3. Select log group -> **Actions -> Edit retention setting**.
4. Set retention to **14 days** (or 7 days if you want stricter cost control).
5. Save.

**Done when:** Retention value is visible on the log group row.

---

## 3) Add ECS health alarm (3 minutes) [MUST]
**Goal:** Get notified if backend task goes down.

1. Open **CloudWatch -> Alarms -> Create alarm**.
2. Select metric:
   - **ECS/ContainerInsights** or **ECS** metrics
   - Choose service running task count metric (commonly `RunningTaskCount`).
   - Filter to your cluster/service.
3. Condition:
   - **Static threshold**: alarm when value is **< 1** for 1 datapoint (or 2 datapoints).
4. Notification:
   - Use existing SNS topic, or create one and add your email.
5. Name alarm: `healthcare-ecs-running-task-low`.
6. Create alarm.

**Done when:** Alarm shows state `OK` and SNS email subscription is confirmed.

---

## 4) Add ALB 5XX alarm (3 minutes) [MUST]
**Goal:** Detect backend/server failures quickly.

1. Open **CloudWatch -> Alarms -> Create alarm**.
2. Select metric:
   - **ApplicationELB** -> by LoadBalancer
   - Metric: `HTTPCode_Target_5XX_Count`
3. Condition:
   - Threshold: **> 0**
   - Period: 5 minutes
   - Evaluation: 1 datapoint (or 2 if you want fewer false alarms)
4. Use same SNS notification topic/email.
5. Name alarm: `healthcare-alb-target-5xx`.
6. Create alarm.

**Done when:** Alarm appears in `OK` state.

---

## 5) Confirm minimal security group exposure (2 minutes) [MUST]
**Goal:** Keep network access minimal and safe.

1. Open **EC2 -> Security Groups**.
2. For **ALB security group**:
   - Inbound: allow **80/443** from `0.0.0.0/0` only (as needed).
3. For **ECS task/service security group**:
   - Inbound: app port (for example 8000) **only from ALB security group**.
   - No open internet inbound directly to ECS tasks.
4. Save if changes were needed.

**Done when:** ECS SG inbound source references ALB SG (not `0.0.0.0/0`).

---

## 6) Keep CloudFront cost-conscious defaults (2 minutes) [MUST]
**Goal:** Lower CDN cost while preserving reliability.

1. Open **CloudFront -> Distributions**.
2. For frontend distribution:
   - Confirm HTTPS is enabled.
   - Set **Price Class = Use Only North America and Europe (Price Class 100)** unless global audience is required.
3. For API distribution:
   - Keep API caching disabled or minimal unless deliberately designed.
   - Keep `OPTIONS` allowed and CORS-related headers forwarded.

**Done when:** Price class and behavior settings are confirmed.

---

## 7) Monthly 5-minute maintenance (recommended)
Do this once per month:

1. Check **AWS Budgets** actual spend vs budget.
2. Check **CloudWatch Alarms** history for frequent triggers.
3. Remove old ECR images (keep latest 3-5).
4. Verify app login paths still work (Doctor/Patient/Admin).

---

## Optional (skip until traffic grows)
- AWS WAF
- GuardDuty
- Multi-AZ database
- Advanced tracing/APM

---

## Fast rollback note (important)
If deployment breaks during demo week:
1. Re-deploy last known good backend image in ECS service.
2. Re-sync previous stable frontend `dist/` to S3.
3. Invalidate CloudFront (`/*`) once.

Keep at least one known-good image tag documented.

---

## One-page summary
If short on time, do these 4 items only:
1. Budget alerts (80% and 100%)
2. Log retention = 14 days
3. ECS running task alarm (<1)
4. ALB target 5XX alarm (>0)
