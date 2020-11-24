async function editFormHandler(event) {
  event.preventDefault();

  const id = window.location.toString().split("/").pop();
  const title = document.querySelector('input[name="post-title"]').value;
  const event_date = document.querySelector('input[name="event-date"]').value;
  const post_content = document.querySelector('input[name="post-body"]').value;


  const response = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, event_date, post_content }),
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    document.location.replace("/dashboard");
  } else {
    alert(response.statusText);
  }
}

document
  .querySelector(".edit-post-form")
  .addEventListener("submit", editFormHandler);
