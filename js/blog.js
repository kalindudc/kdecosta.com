marked.setOptions({
  renderer: new marked.Renderer(),
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
  pedantic: false,
  gfm: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

main();

async function main() {
  var params = new URLSearchParams(window.location.search);
  console.log(params);
  if (params.has("article")) {
    var articleName = sanitizeString(params.get("article"));
    var ok = await renderMarkdown("/blog/articles/" + articleName + ".md");
    if (!ok) {
      // for github
      ok = await renderMarkdown("https://raw.githubusercontent.com/kalindudc/kalindudc.github.io/master/blog/articles/" + articleName + ".md");
      console.log(ok)
    }
    if (!ok) {
      window.location = "/404"
    }

  }
  else {
    if (params.toString().length > 0) {
      window.location = "/404"
    }

    fetchFrom(false)
      .then(ok => {
        if (!ok) {
          fetchFrom(true)
            .then(ok => {
              if (!ok) {
                window.location = "/404";
              }
            });
        }
      });

  }
}

async function fetchFrom(isGithub) {
  console.log("is github", isGithub)
  var path = "/blog/articles/";
  if (isGithub) {
    path = "https://api.github.com/repos/kalindudc/kalindudc.github.io/contents/blog/articles";
  }
  console.log("path", path)

  var resp = await fetch(path,
    {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
    .then(data => {
      if (!data.ok) {
        return false;
      }
      else {
        return data.json();
      }
    })
    .then(body => {
      if (!body) {
        return false;
      }

      if ((!isGithub && body.files.length < 2) || (isGithub && body.length < 1)) {
        document.getElementById('content').innerHTML = "Blog is empty"
        return true;
      }
      renderListOfArticles(isGithub ? body : body.files.slice(1))
        .then(posts => {
          posts.forEach(post => {
            addPostToList(post);
          });
          $(".blog-post-listing").each(function() {
            ScrollReveal().reveal(this, { distance: "40px", delay: 200 });
          });
          return true;
        });
      return true;
    });

  return resp;
}

async function renderMarkdown(path) {
  return await fetch(path)
    .then(data => {

      if (!data.ok) {
        return false;
      }
      else {
        return data.text()
      }
    })
    .then(html => {
      if (!html) {
        return false;
      }

      var front = yamlFront.loadFront(html);
      document.getElementById('content').innerHTML = `
      <div class="post-content fill">${marked.parse(front.__content)}</div>
    `
      document.getElementById('tab-title').innerHTML = front.title
      return true;
    });
}

async function renderListOfArticles(files) {
  document.getElementById('content').innerHTML = '<div id="blog-posts-list"></div>'

  var posts = []
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var name = file.name.replace(".md", "")
    var response = await fetch("/blog/articles/" + name + ".md");
    if (!response.ok) {
      // for github
      response = await fetch("https://raw.githubusercontent.com/kalindudc/kalindudc.github.io/master/blog/articles/" + name + ".md");
    }
    if (!response.ok) {
      return;
    }
    var contents = await response.text()
    var front = yamlFront.loadFront(contents);
    front.fileName = name;
    posts.push(front);
  }

  posts.sort(function compare(a, b) {
    var dateA = new Date(a.date);
    var dateB = new Date(b.date);
    return dateB - dateA;
  });

  return posts;
}

function addPostToList(data) {
  document.getElementById('blog-posts-list').innerHTML += `
    <a href="/blog?article=${data.fileName}">
      <div class="blog-post-listing">
        <div class="top">
          <div class="title">
            ${data.title}
          </div>
          <div class="date">
            ${data.date}
          </div>
        </div>
        <div class="bottom">
          ${data.description}
        </div>
      </div>
    </a>
  `;
}

function sanitizeString(str) {
  str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim, "");
  return str.trim();
}
