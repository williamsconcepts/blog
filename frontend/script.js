const API = "http://localhost:5000";

const titleInput = document.querySelector("#postTitle");

const contentInput = document.querySelector("#postContent");

const categorySelect = document.querySelector("#categorySelect");

const publishBtn = document.querySelector("#publishBtn");

const postsContainer = document.querySelector("#postsContainer");

const categoryList = document.querySelector("#categoryList");

const popularPosts = document.querySelector("#popularPosts");

// =======================
// LOAD CATEGORY
// =======================

async function loadCategories() {
  const res = await fetch(`${API}/categories`);

  const categories = await res.json();

  categorySelect.innerHTML = `
<option>
Select category
</option>
`;

  categoryList.innerHTML = "";

  categories.forEach((cat) => {
    categorySelect.innerHTML += `

<option value="${cat.id}">

${cat.title}

</option>

`;

    categoryList.innerHTML += `
<br>
<li >

${cat.title}

</li>

`;
  });
}

// =======================
// CREATE POST
// =======================

publishBtn.onclick = async () => {
  const data = {
    title: titleInput.value,

    postContent: contentInput.value,

    categoryId: categorySelect.value,
  };

  await fetch(
    `${API}/posts/create`,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    },
  );

  titleInput.value = "";

  contentInput.value = "";

  loadPosts();
};

// =======================
// LOAD POSTS with Comments
// =======================

async function loadPosts() {
  const res = await fetch(`${API}/posts`);

  const posts = await res.json();

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    postsContainer.innerHTML += `

<div class="post-card">


<div class="post-header">


<h2>

${post.title}

</h2>


<span>

•••

</span>


</div>






<div class="meta">

${new Date(post.createdAt).toDateString()}
•

${post.category}



</div>







<p>

${post.postContent}

</p>







<div class="stats">


<button onclick="likePost(${post.id})">


❤️ ${post.likes} Likes


</button>



<span>

💬 ${post.comments.length} Comments

</span>



</div>







<!-- COMMENTS -->

<div class="comments">


<h4>

Comments

</h4>



${
  post.comments.length === 0
    ? `

<p>
No comments yet
</p>

`
    : post.comments
        .map(
          (comment) =>
            `

<div class="comment">


<div class="avatar">

${comment.userName.charAt(0).toUpperCase()}

</div>



<div>


<b>

${comment.userName}

</b>


<p>

${comment.comment}

</p>



<small>

Reply

</small>



</div>



</div>


`,
        )
        .join("")
}



</div>








<div class="comment-box">


<input

id="name-${post.id}"

placeholder="Your name"


/>





<textarea

id="comment-${post.id}"

placeholder="Write a comment"

></textarea>





<button onclick="addComment(${post.id})">


Post Comment


</button>



</div>





</div>


`;
  });
}

// =======================
// LIKE
// =======================

async function likePost(id) {
  await fetch(
    `${API}/posts/${id}/like`,

    {
      method: "PATCH",
    },
  );

  loadPosts();
}

// =======================
// COMMENT
// =======================

async function addComment(id) {
  const username = document.querySelector(`#name-${id}`).value;

  const comment = document.querySelector(`#comment-${id}`).value;

  await fetch(
    `${API}/posts/${id}/comments`,

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username,

        comment,
      }),
    },
  );

  alert("Comment added");
  loadPosts();
}

// =======================
// POPULAR
// =======================

async function loadPopular() {
  const res = await fetch(`${API}/posts/popular`);

  const posts = await res.json();

  popularPosts.innerHTML = "";

  posts.forEach((post) => {
    popularPosts.innerHTML += `
<br>
<div class="popular">


<b>

${post.title}

</b>


<p>

❤️ ${post.likes}

</p>



</div>


`;
  });
}

loadCategories();

loadPosts();

loadPopular();
