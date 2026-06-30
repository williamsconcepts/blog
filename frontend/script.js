const API = "http://localhost:5000";

// =======================
// DOM
// =======================

const titleInput = document.querySelector("#postTitle");
const contentInput = document.querySelector("#postContent");
const categorySelect = document.querySelector("#categorySelect");
const publishBtn = document.querySelector("#publishBtn");

const postsContainer = document.querySelector("#postsContainer");
const categoryList = document.querySelector("#categoryList");
const popularPosts = document.querySelector("#popularPosts");

// AUTH

const authBtn = document.querySelector("#authBtn");

const authModal = document.querySelector("#authModal");

const closeModal = document.querySelector("#closeModal");

const loginForm = document.querySelector("#loginForm");

const registerForm = document.querySelector("#registerForm");

const toggleAuth = document.querySelector("#toggleAuth");

const authTitle = document.querySelector("#authTitle");

const userAvatar = document.querySelector("#userAvatar");

const usernameDisplay = document.querySelector("#username");

// =======================
// TOKEN
// =======================

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",

    Authorization: `Bearer ${getToken()}`,
  };
}

// =======================
// AUTH STATE
// =======================

function updateAuthButton() {
  const token = getToken();

  if (token) {
    authBtn.textContent = "Logout";

    authBtn.onclick = logout;
  } else {
    authBtn.textContent = "Login";

    authBtn.onclick = () => {
      authModal.style.display = "flex";
    };
  }
}

function logout() {
  localStorage.removeItem("token");

  userAvatar.textContent = "JD";

  usernameDisplay.innerHTML = `
  John Doe
  <i class="fa-solid fa-chevron-down"></i>
  `;

  updateAuthButton();

  alert("Logged out successfully");
}

// =======================
// MODAL
// =======================

updateAuthButton();

closeModal.onclick = () => {
  authModal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === authModal) {
    authModal.style.display = "none";
  }
};

toggleAuth.onclick = () => {
  loginForm.classList.toggle("hidden");

  registerForm.classList.toggle("hidden");

  if (loginForm.classList.contains("hidden")) {
    authTitle.textContent = "Register";

    toggleAuth.textContent = "Already have account? Login";
  } else {
    authTitle.textContent = "Login";

    toggleAuth.textContent = "Create account";
  }
};

// =======================
// LOGIN
// =======================

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#loginEmail").value;

  const password = document.querySelector("#loginPassword").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,

      password,
    }),
  });

  const data = await res.json();

  if (data.token || data.accessToken) {
    const token = data.token || data.accessToken;

    localStorage.setItem("token", token);

    alert("Login successful");

    authModal.style.display = "none";

    loadCurrentUser();

    updateAuthButton();
  } else {
    alert(data.message || "Login failed");
  }
});

// =======================
// REGISTER
// =======================

registerForm.addEventListener(
  "submit",

  async (e) => {
    e.preventDefault();

    const name = document.querySelector("#registerName").value;

    const email = document.querySelector("#registerEmail").value;

    const password = document.querySelector("#registerPassword").value;

    const res = await fetch(
      `${API}/register`,

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,

          email,

          password,
        }),
      },
    );

    const data = await res.json();

    alert(data.message);
  },
);

// =======================
// CURRENT USER
// =======================

async function loadCurrentUser() {
  const token = getToken();

  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    userAvatar.textContent = payload.name.charAt(0).toUpperCase();

    usernameDisplay.innerHTML = `
${payload.name}

<i class="fa-solid fa-chevron-down"></i>
`;
  } catch (error) {
    console.log(error);

    localStorage.removeItem("token");
  }
}

// =======================
// CATEGORIES
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

<li>

${cat.title}

</li>

`;
  });
}

// =======================
// CREATE POST
// =======================

publishBtn.onclick = async () => {
  if (!getToken()) {
    alert("Please login first");

    return;
  }

  const data = {
    title: titleInput.value,

    postContent: contentInput.value,

    categoryId: categorySelect.value,
  };

  const res = await fetch(
    `${API}/posts/create`,

    {
      method: "POST",

      headers: authHeaders(),

      body: JSON.stringify(data),
    },
  );

  const result = await res.json();

  alert(result.message || "Post created");

  titleInput.value = "";

  contentInput.value = "";

  loadPosts();
};

// =======================
// LOAD POSTS
// =======================

async function loadPosts(query = "") {
  try {
    const res = await fetch(`${API}/posts${query}`);

    let posts = await res.json();

    if (!Array.isArray(posts)) {
      posts = Object.values(posts).flat();
    }

    postsContainer.innerHTML = "";

    posts.forEach((post) => {
      postsContainer.innerHTML += `


<div class="post-card">


<h2>

${post.title}

</h2>



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

❤️ ${post.likes}

</button>


<span>

💬 ${post.comments.length}

</span>


</div>





<div class="comments">


<h4>

Comments

</h4>



${
  post.comments.length
    ? post.comments
        .map(
          (c) => `

<div class="comment">


<div class="avatar">

${c.username[0].toUpperCase()}

</div>



<div>


<b>

${c.username}

</b>


<p>

${c.comment}

</p>


</div>


</div>


`,
        )
        .join("")
    : "<p>No comments</p>"
}



</div>






<div class="comment-box">


<input
id="name-${post.id}"
placeholder="Name"
/>



<textarea
id="comment-${post.id}"
placeholder="Comment"
></textarea>



<button onclick="addComment(${post.id})">

Post Comment

</button>


</div>




</div>


`;
    });
  } catch (error) {
    console.log(error);
  }
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

  loadPosts();
}

// =======================
// POPULAR POSTS
// =======================

async function loadPopular() {
  let posts = await fetch(`${API}/posts?sort=likes&order=desc`).then((res) =>
    res.json(),
  );

  if (!Array.isArray(posts)) {
    posts = Object.values(posts).flat();
  }

  popularPosts.innerHTML = "";

  posts
    .slice(0, 3)

    .forEach((post) => {
      popularPosts.innerHTML += `


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

// =======================
// START APP
// =======================

loadCategories();

loadPosts("?commentLimit=2");

loadPopular();

loadCurrentUser();

updateAuthButton();
