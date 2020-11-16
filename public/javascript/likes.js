async function likeClickHandler(event) {
    event.preventDefault();
  
    const id = window.location.toString().split('/').pop();
  
    const response = await fetch('/api/posts/like', {
      method: 'PUT',
      body: JSON.stringify({ post_id: id }),
      headers: { 'Content-Type': 'application/json' }
    });
  
    if (response.ok) {
      document.location.reload();
    } else {
      alert(response.statusText);
    }
  }
  
  document.querySelector('.upvote-btn').addEventListener('click', likeClickHandler);