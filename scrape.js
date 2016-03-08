var els = document.querySelectorAll('.posters li')
var reviews = []
var reviewer = location.pathname.split('/')[1]
var rating
var i, L
var file
var entity
for (i = 0, L = els.length; i < L; i++) {
  var title = els[i].querySelector('h2 a').textContent

  var year = els[i].querySelector('h2 small').textContent
  var stars = ''
  var ratingEl = els[i].querySelector('span.rating')
  if (ratingEl) {
    rating = ratingEl.className.split('-')[1] / 2
  }
  var review = ''
  var reviewEl = els[i].querySelector('div.text')
  if (reviewEl) {
     review = reviewEl.textContent.replace(/\s+/g, ' ')
  }
  entity = [
    {"category":"person", "entity": reviewer},
    {"category":"rating", "entity":rating},
    {"category":"category","entity":year}
  ]

  rating = {
    "reviewer" : reviewer,
    "title" : title,
    "year" : year,
    "rating" : rating,
    "review" : review.replace(/"/g, ''),
    "review_words" : review.split(' ').length,
    "entity" : entity
  }

  reviews.push(rating)
}

for (i = 0, L = reviews.length; i < L; i++) {
  reviewer = reviews[i].reviewer
  console.log(`all_reviews.${reviewer}.push(${JSON.stringify(reviews[i])})`)
}

bulk = ''
index = 'dossiers'
type = 'attachment'
for (i = 0, L = reviews.length; i < L; i++) {
continue;
  rating = reviews[i]
  try {
    file = btoa(rating.review)
  } catch(e) {
    file = btoa(reviews.slice(0, 600))
  }

  entity = JSON.stringify([
    {"category":"person", "entity": `${rating.reviewer}`},
    {"category":"category", "entity":`${rating.rating}`},
    {"category":"category","entity":`${rating.year}`}
  ])
  entities = JSON.stringify(entity)
  bulk += `{"index" : { "_index" : "${index}", "_type" : "${type}" }}
{"owner" : "${rating.reviewer}", "title" : "${rating.title}", "locs" : [], "body" : "${rating.review}", "file" : "${file}", "review_words":"${rating.review_words}", "entity" : ${entity}, "entities" : ${entities} }` + "\n"
}

// console.log(bulk);
