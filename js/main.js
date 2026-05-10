function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

ScrollReveal().reveal("div", {distance: "40px"});
$(".project-item").each(function(){
  ScrollReveal().reveal(this, {delay: getRandomInt(400)});
});

var year = new Date().getFullYear();

fetch('/templates/header.html')
  .then(data => data.text())
  .then(html => document.getElementById('header').innerHTML = html);

fetch('/templates/footer.html')
  .then(data => data.text())
  .then(html => document.getElementById('footer').innerHTML = html.replace("{year}", year));
