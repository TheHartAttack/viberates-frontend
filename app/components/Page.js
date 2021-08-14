import React, {useEffect} from "react"
import Container from "./Container"

function Page(props) {
  useEffect(() => {
    document.title = `VibeRates${props.title ? ` | ${props.title}` : ""}`
    window.scrollTo(0, 0)
  }, [props.title])

  return <Container>{props.children}</Container>
}

export default Page
