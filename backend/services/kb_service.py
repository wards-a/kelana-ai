import os

import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")

def get_bedrock_agent_runtime_client():
    return boto3.client(
        service_name="bedrock-agent-runtime",
        region_name=AWS_REGION
    )

def retrieve_and_generate(query: str) -> dict:
    missing_vars = [
        name
        for name, value in {
            "KNOWLEDGE_BASE_ID": KNOWLEDGE_BASE_ID,
        }.items()
        if not value
    ]
    if missing_vars:
        raise ValueError(
            f"{', '.join(missing_vars)} is not set."
            "Check your .env file"
        )
    
    client = get_bedrock_agent_runtime_client()

    response = client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={"text": query},
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": 5,
            },
        },
    )

    results = response.get("retrievalResults", [])
    snippets = []
    sources = []
    seen_sources = set()

    for result in results:
        content = result.get("content", {})
        text = content.get("text", "").strip()
        if text:
            snippets.append(text)
        
        source_key = result.get("documentId") or repr(result.get("location"))
        if source_key in seen_sources:
            continue
        
        seen_sources.add(source_key)
        sources.append(
            {
                "document_id": result.get("documentId"),
                "location": result.get("location"),
                "metadata": result.get("metadata", {}),
                "score": result.get("score"),
            }
        )

        return {
            "answer": "\n\n".join(snippets),
            "source": sources,
        }