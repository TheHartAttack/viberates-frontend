import React from "react"
import ReactDOMServer from "react-dom/server"
import fs from "fs"
import Loading from "./app/components/Loading"

function Shell() {
  return (
    <div>
      <Loading className="generated" />
    </div>
  )
}

function html(x) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>VibeRates</title>
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    </head>
    <body>
      <div id="app">
      ${x}
      </div>
    </body>
  </html>
  `
}

const reactHtml = ReactDOMServer.renderToStaticMarkup(<Shell />)

const overallHtmlString = html(reactHtml)

const fileName = "./app/index-build-template.html"
const stream = fs.createWriteStream(fileName)
stream.once("open", () => {
  stream.end(overallHtmlString)
})
