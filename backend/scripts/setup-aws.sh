#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Jesse v2 — AWS Infrastructure Setup
# Run once after: aws configure --profile endevo-dev
#
# Usage:
#   chmod +x scripts/setup-aws.sh
#   ./scripts/setup-aws.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

PROFILE="endevo-dev"
REGION="us-east-2"
DYNAMO_TABLE="jesse-users"
S3_KNOWLEDGE="jesse-endevo-knowledge"

ACCOUNT_ID=$(aws sts get-caller-identity --profile "$PROFILE" --query Account --output text)
echo ""
echo "════════════════════════════════════════════════════════"
echo "  Jesse v2 AWS Setup"
echo "  Account : $ACCOUNT_ID"
echo "  Region  : $REGION"
echo "  Profile : $PROFILE"
echo "════════════════════════════════════════════════════════"
echo ""

# ── 1. DynamoDB ────────────────────────────────────────────────────────────────
echo "▶ Creating DynamoDB table: $DYNAMO_TABLE"
if aws dynamodb describe-table --table-name "$DYNAMO_TABLE" --profile "$PROFILE" --region "$REGION" > /dev/null 2>&1; then
  echo "  ✓ Table already exists — skipping"
else
  aws dynamodb create-table \
    --table-name "$DYNAMO_TABLE" \
    --attribute-definitions \
      AttributeName=userId,AttributeType=S \
      AttributeName=sessionId,AttributeType=S \
    --key-schema \
      AttributeName=userId,KeyType=HASH \
      AttributeName=sessionId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --profile "$PROFILE" --region "$REGION"
  echo "  ✓ Table created (PAY_PER_REQUEST billing)"
fi

# Optional GSI: query all sessions for a domain across all users (for analytics)
echo "  Adding GSI: domainKey-completedAt-index"
aws dynamodb update-table \
  --table-name "$DYNAMO_TABLE" \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=sessionId,AttributeType=S \
    AttributeName=domainKey,AttributeType=S \
    AttributeName=completedAt,AttributeType=S \
  --global-secondary-index-updates '[
    {
      "Create": {
        "IndexName": "domainKey-completedAt-index",
        "KeySchema": [
          {"AttributeName":"domainKey","KeyType":"HASH"},
          {"AttributeName":"completedAt","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    }
  ]' \
  --profile "$PROFILE" --region "$REGION" > /dev/null 2>&1 || echo "  (GSI may already exist — skipping)"

# ── 2. S3: Knowledge base bucket ─────────────────────────────────────────────
echo ""
echo "▶ Creating S3 bucket: $S3_KNOWLEDGE"
if aws s3api head-bucket --bucket "$S3_KNOWLEDGE" --profile "$PROFILE" > /dev/null 2>&1; then
  echo "  ✓ Bucket already exists — skipping"
else
  aws s3 mb "s3://$S3_KNOWLEDGE" --region "$REGION" --profile "$PROFILE"
  aws s3api put-public-access-block \
    --bucket "$S3_KNOWLEDGE" \
    --public-access-block-configuration \
      BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
    --profile "$PROFILE"
  # Create knowledge-base/ prefix
  aws s3api put-object \
    --bucket "$S3_KNOWLEDGE" \
    --key "knowledge-base/" \
    --profile "$PROFILE" > /dev/null
  echo "  ✓ Knowledge base bucket created + knowledge-base/ folder ready"
fi

# ── 4. IAM Policy for backend ─────────────────────────────────────────────────
echo ""
echo "▶ Creating IAM policy: JesseV2BackendPolicy"
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/JesseV2BackendPolicy"
POLICY_DOC='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDB",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem","dynamodb:GetItem","dynamodb:Query",
        "dynamodb:UpdateItem","dynamodb:DeleteItem","dynamodb:BatchGetItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:'"$REGION"':'"$ACCOUNT_ID"':table/'"$DYNAMO_TABLE"'",
        "arn:aws:dynamodb:'"$REGION"':'"$ACCOUNT_ID"':table/'"$DYNAMO_TABLE"'/index/*"
      ]
    },
    {
      "Sid": "BedrockKB",
      "Effect": "Allow",
      "Action": ["bedrock:Retrieve","bedrock:InvokeModel"],
      "Resource": "*"
    }
  ]
}'

if aws iam get-policy --policy-arn "$POLICY_ARN" --profile "$PROFILE" > /dev/null 2>&1; then
  echo "  ✓ Policy already exists — skipping"
else
  aws iam create-policy \
    --policy-name JesseV2BackendPolicy \
    --policy-document "$POLICY_DOC" \
    --profile "$PROFILE" > /dev/null
  echo "  ✓ Policy created: JesseV2BackendPolicy"
fi

# Attach to the endevo-dev user
echo "  Attaching policy to IAM user: endevo-dev"
aws iam attach-user-policy \
  --user-name endevo-dev \
  --policy-arn "$POLICY_ARN" \
  --profile "$PROFILE" 2>/dev/null || echo "  (already attached or attach failed — check manually)"

# ── 5. Summary ────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ AWS Infrastructure Ready"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  DynamoDB:      $DYNAMO_TABLE  (us-east-2)"
echo "  S3 Knowledge:  s3://$S3_KNOWLEDGE/knowledge-base/"
echo ""
echo "  ─── Manual steps still needed ───────────────────────"
echo "  1. Upload domain knowledge docs to:"
echo "       s3://$S3_KNOWLEDGE/knowledge-base/"
echo "     (legal.md, financial.md, physical.md, digital.md)"
echo ""
echo "  2. In AWS Console → Bedrock → Knowledge Bases → Create:"
echo "       Name:         jesse-knowledge-base"
echo "       Data source:  s3://$S3_KNOWLEDGE/knowledge-base/"
echo "       Embed model:  Amazon Titan Embeddings v2"
echo "       Vector store: Amazon OpenSearch Serverless (auto-create)"
echo "     Click Sync after creation."
echo ""
echo "  3. Copy the Knowledge Base ID and add to backend .env:"
echo "       BEDROCK_KNOWLEDGE_BASE_ID=XXXXXXXXXX"
echo ""
echo "  4. Add to backend .env / Vercel env vars:"
echo "       AWS_ACCESS_KEY_ID=..."
echo "       AWS_SECRET_ACCESS_KEY=..."
echo "       AWS_REGION=$REGION"
echo "       DYNAMO_TABLE=$DYNAMO_TABLE"
echo "       BEDROCK_KNOWLEDGE_BASE_ID=<from step 2>"
echo "════════════════════════════════════════════════════════"
