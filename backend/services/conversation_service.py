from database import SessionLocal
from models.conversation import Conversation, Message
from sqlalchemy.exc import IntegrityError

class ConversationError(Exception):
    """Custom exception for conversation errors"""
    pass

def create_conversation(user_id: int, title: str, messages: list[dict]) -> dict:
    """
    Create a new conversation with messages
    
    Args:
        user_id: User ID who owns the conversation
        title: Title of the conversation
        messages: List of message dictionaries with 'role' and 'content'
        
    Returns:
        Dictionary containing conversation and messages
        
    Raises:
        ConversationError: If conversation creation fails
    """
    db = SessionLocal()
    try:
        # Create conversation
        conversation = Conversation(
            user_id=user_id,
            title=title
        )
        db.add(conversation)
        db.flush()  # Get the conversation ID
        
        # Add messages
        message_list = []
        for msg in messages:
            message = Message(
                conversation_id=conversation.id,
                role=msg.get("role"),
                content=msg.get("content")
            )
            db.add(message)
            message_list.append(message)
        
        db.commit()
        db.refresh(conversation)
        
        # Refresh all messages to get their IDs
        for msg in message_list:
            db.refresh(msg)
        
        # Return conversation with messages
        return {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "title": conversation.title,
            "created_at": conversation.created_at,
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at
                }
                for msg in message_list
            ]
        }
    
    except IntegrityError as e:
        db.rollback()
        raise ConversationError(f"Failed to create conversation: {str(e)}")
    except Exception as e:
        db.rollback()
        raise ConversationError(f"Failed to create conversation: {str(e)}")
    finally:
        db.close()

def get_conversation(user_id: int, conversation_id: int) -> dict:
    """
    Get a conversation with all messages (with ownership verification)
    
    Args:
        user_id: User ID making the request
        conversation_id: Conversation ID to retrieve
        
    Returns:
        Dictionary containing conversation and messages
        
    Raises:
        ConversationError: If conversation not found or user doesn't own it
    """
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            raise ConversationError(f"Conversation with id {conversation_id} not found")
        
        # Verify user owns this conversation
        if conversation.user_id != user_id:
            raise ConversationError("You do not have permission to view this conversation")
        
        # Get messages for this conversation
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()
        
        return {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "title": conversation.title,
            "created_at": conversation.created_at,
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at
                }
                for msg in messages
            ]
        }
    
    except ConversationError:
        raise
    except Exception as e:
        raise ConversationError(f"Failed to retrieve conversation: {str(e)}")
    finally:
        db.close()

def get_user_conversations(user_id: int) -> list[dict]:
    """
    Get all conversations for a user
    
    Args:
        user_id: User ID to get conversations for
        
    Returns:
        List of conversations
        
    Raises:
        ConversationError: If retrieval fails
    """
    db = SessionLocal()
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(Conversation.created_at.desc()).all()
        
        result = []
        for conv in conversations:
            # Count messages for each conversation
            message_count = db.query(Message).filter(
                Message.conversation_id == conv.id
            ).count()
            
            result.append({
                "id": conv.id,
                "user_id": conv.user_id,
                "title": conv.title,
                "created_at": conv.created_at,
                "message_count": message_count
            })
        
        return result
    
    except Exception as e:
        raise ConversationError(f"Failed to retrieve conversations: {str(e)}")
    finally:
        db.close()

def update_conversation_title(user_id: int, conversation_id: int, new_title: str) -> dict:
    """
    Update the title of a conversation (with ownership verification)
    
    Args:
        user_id: User ID making the request
        conversation_id: Conversation ID to update
        new_title: New title for the conversation
        
    Returns:
        Updated conversation data
        
    Raises:
        ConversationError: If conversation not found or user doesn't own it
    """
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            raise ConversationError(f"Conversation with id {conversation_id} not found")
        
        # Verify user owns this conversation
        if conversation.user_id != user_id:
            raise ConversationError("You do not have permission to edit this conversation")
        
        # Update title
        conversation.title = new_title
        db.commit()
        db.refresh(conversation)
        
        return {
            "id": conversation.id,
            "user_id": conversation.user_id,
            "title": conversation.title,
            "created_at": conversation.created_at
        }
    
    except ConversationError:
        raise
    except Exception as e:
        db.rollback()
        raise ConversationError(f"Failed to update conversation: {str(e)}")
    finally:
        db.close()

def delete_conversation(user_id: int, conversation_id: int) -> dict:
    """
    Delete a conversation (with ownership verification)
    
    Args:
        user_id: User ID making the request
        conversation_id: Conversation ID to delete
        
    Returns:
        Dictionary with success message
        
    Raises:
        ConversationError: If conversation not found or user doesn't own it
    """
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            raise ConversationError(f"Conversation with id {conversation_id} not found")
        
        # Verify user owns this conversation
        if conversation.user_id != user_id:
            raise ConversationError("You do not have permission to delete this conversation")
        
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
    
    except ConversationError:
        raise
    except Exception as e:
        db.rollback()
        raise ConversationError(f"Failed to delete conversation: {str(e)}")
    finally:
        db.close()

def add_message_to_conversation(conversation_id: int, user_id: int, role: str, content: str) -> dict:
    """
    Add a message to an existing conversation
    
    Args:
        conversation_id: Conversation ID to add message to
        user_id: User ID making the request (for ownership verification)
        role: Role of the message ("user" or "assistant")
        content: Content of the message
        
    Returns:
        Dictionary containing the created message
        
    Raises:
        ConversationError: If conversation not found or user doesn't own it
    """
    db = SessionLocal()
    try:
        # Verify conversation exists and user owns it
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            raise ConversationError(f"Conversation with id {conversation_id} not found")
        
        if conversation.user_id != user_id:
            raise ConversationError("You do not have permission to add messages to this conversation")
        
        # Create and add message
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        
        return {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at
        }
    
    except ConversationError:
        raise
    except Exception as e:
        db.rollback()
        raise ConversationError(f"Failed to add message: {str(e)}")
    finally:
        db.close()
