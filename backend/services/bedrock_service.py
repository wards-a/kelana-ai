from dotenv import load_dotenv
import boto3
import os
from typing import Optional

# Load environment variables from .env
load_dotenv()


def configure_bedrock_client():
    """
    Configure and return AWS Bedrock Runtime client using environment variables.
    
    Returns:
        boto3.client: Configured Bedrock Runtime client
    """
    # Get AWS credentials and configuration from environment
    aws_region = os.getenv("AWS_REGION")
    aws_bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    
    if not aws_region:
        raise ValueError("AWS_REGION not found in environment variables")
    
    if not aws_bearer_token:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK not found in environment variables")
    
    # Create the Bedrock Runtime client
    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=aws_region,
        # aws_access_key_id=aws_bearer_token.split(':')[0] if ':' in aws_bearer_token else aws_bearer_token,
    )
    
    return client


def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
    model_id: Optional[str] = None
) -> str:
    """
    Get AI-powered travel itinerary recommendation from AWS Bedrock.
    
    Args:
        destination: The travel destination
        days: Number of days for the trip
        budget: Budget in USD
        travel_style: Style of travel (e.g., adventure, luxury, budget, cultural)
        model_id: Optional model ID, defaults to environment variable MODEL_ID
    
    Returns:
        str: AI-generated itinerary recommendation
    """
    # Get the Bedrock client
    client = configure_bedrock_client()
    
    # Use provided model_id or fall back to environment variable
    if model_id is None:
        model_id = os.getenv("MODEL_ID")
        if not model_id:
            raise ValueError("MODEL_ID not found in environment variables")
    
    # Create the prompt with user parameters
    prompt = f"""You are an experienced travel planner.

Plan a {days}-day itinerary for {destination}.

Budget: USD {budget}

Travel Style: {travel_style}

Draw up a daily plan for activities each day: two to three activities in the morning, visits to cultural sites and local attractions in the afternoon, and an evening out for dinner followed by a visit to a nightlife venue.

Give the answer as markdown format with headers (##) and bullet lists (-)."""
    
    # Send the prompt using the Converse API
    response = client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    )
    
    # Extract and return the AI response
    ai_response = response["output"]["message"]["content"][0]["text"]
    return ai_response
