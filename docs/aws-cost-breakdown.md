# AWS Cost Breakdown — Jesse v2 / ENDevo

Last updated: March 2026
AWS Credit available: $10,000 (MVP budget)

---

## Monthly Cost Estimate

### Active Services

| Service | Usage | Est. Monthly Cost |
|---------|-------|-------------------|
| **DynamoDB** (jesse-users) | PAY_PER_REQUEST — ~1000 reads/writes/month | ~$0.50 |
| **S3** (jesse-endevo-knowledge) | Storage for knowledge docs (<1GB) | ~$0.02 |
| **Bedrock — Titan Embeddings V2** | On-demand, only charged on KB sync | ~$0.01 |
| **Bedrock — KB Retrieval** | ~$0.10 per 1M tokens | ~$0.10 |
| **Aurora PostgreSQL Serverless v2** | jesse-vector-db, MinCapacity=0, MaxCapacity=4 | ~$40-50/month |
| **Anthropic Claude** (AI plans) | ~1000 assessments × ~2500 tokens | ~$15.00 |

**Total AWS est. per month (MVP): ~$56**

> With $10K AWS credit this covers ~14 months of runway.
> Vector store: Aurora PostgreSQL Serverless v2 (scales to near-zero when idle).

---

## Non-AWS Services (separate billing)

| Service | Cost |
|---------|------|
| Anthropic Claude API | ~$15/month at MVP scale |
| Resend (email) | Free tier (3000 emails/month) |
| Firebase (Google Auth) | Free (Spark plan) |
| Vercel (frontend hosting) | Free (Hobby) or $20/month (Pro) |

---

## Cost Optimisation Notes

### OpenSearch Serverless (~$700/month) — main cost driver
- Minimum 2 OCUs regardless of usage — this is the largest line item
- Acceptable during MVP with $10K credit (~13 months runway)
- **Post-MVP plan**: migrate vector store to Pinecone free tier (0 cost until 100K vectors)
  or Aurora PostgreSQL Serverless v2 (~$40-50/month) when credit runs out
- Do NOT sync the KB until Aryan uploads knowledge docs — avoids unnecessary OCU spin-up

### DynamoDB
- PAY_PER_REQUEST billing — scales to near-zero with no traffic
- No minimum charge

### Bedrock Titan Embeddings
- On-demand — only charged when KB is synced (docs are indexed)
- Re-sync cost for 4 domain docs (~500K tokens) = ~$0.01 per sync

### S3
- Near-zero cost — only stores knowledge base docs (PDFs, text, markdown)
- No PDF storage for user reports (users export/download directly, not stored)

---

## Scaling Estimates

| Monthly Active Users | DynamoDB | Bedrock Retrieval | OpenSearch | Total AWS |
|---------------------|----------|-------------------|------------|-----------|
| 100 | ~$0.50 | ~$0.01 | ~$700 | ~$701 |
| 1,000 | ~$2.00 | ~$0.10 | ~$700 | ~$703 |
| 10,000 | ~$15.00 | ~$1.00 | ~$700 | ~$717 |
| 50,000 | ~$60.00 | ~$5.00 | ~$1,400* | ~$1,466 |

*OpenSearch scales OCUs at high query volume

---

## AWS Resources Created

| Resource | Name | Region |
|----------|------|--------|
| DynamoDB Table | jesse-users | us-east-2 |
| S3 Bucket (knowledge) | jesse-endevo-knowledge | us-east-2 |
| Bedrock Knowledge Base | jesse-knowledge-base | us-east-2 |
| Bedrock KB ID | Y52P6BJVGP | us-east-2 |
| Aurora PostgreSQL Cluster | jesse-vector-db | us-east-2 |
| Aurora Instance | jesse-vector-db-instance | us-east-2 |
| Secrets Manager | jesse-vector-db-credentials | us-east-2 |
| IAM Policy (backend) | JesseV2BackendPolicy | global |
| IAM Policy (Aryan) | AryanAIDevPolicy | global |

---

## IAM Users

| User | Role | Permissions |
|------|------|-------------|
| endevo-dev | Admin / backend deploy | DynamoDB full, S3 knowledge, Bedrock retrieve |
| aryan-ai-dev | AI/ML engineer | Bedrock full, S3 knowledge read/write, DynamoDB read-only |

---

## Post-MVP Cost Reduction Plan

1. Replace OpenSearch Serverless with **Pinecone free tier** → saves ~$700/month
2. Evaluate Aurora PostgreSQL Serverless v2 if Pinecone limits are hit (~$40/month)
3. Move frontend to **Vercel Pro** only if team size warrants it ($20/month)
4. Enable **DynamoDB TTL** on old sessions to keep table lean
