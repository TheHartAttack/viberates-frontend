import React, {useEffect, Suspense} from "react"
import ReactDOM from "react-dom"
import {useImmerReducer} from "use-immer"
import {BrowserRouter, Switch, Route} from "react-router-dom"
import {CSSTransition} from "react-transition-group"
import _ from "lodash"
import Axios from "axios"
// Axios.defaults.baseURL = process.env.BACKENDURL
Axios.defaults.baseURL = "https://viberates.onrender.com"

//Stylesheet
import "./assets/styles/styles.css"

//Contexts & Reducer
import StateContext from "./contexts/StateContext"
import DispatchContext from "./contexts/DispatchContext"
import Reducer from "./reducers/Reducer"

//Components
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./components/Home"
const HotAlbums = React.lazy(() => import("./components/HotAlbums"))
const TopRated = React.lazy(() => import("./components/TopRated"))
const NewReleases = React.lazy(() => import("./components/NewReleases"))
const TopUsers = React.lazy(() => import("./components/TopUsers"))
const RecentReviews = React.lazy(() => import("./components/RecentReviews"))
const AddArtist = React.lazy(() => import("./components/AddArtist"))
const ArtistContext = React.lazy(() => import("./components/ArtistContext"))
const EditHistoryArtist = React.lazy(() => import("./components/EditHistoryArtist"))
const AlbumContext = React.lazy(() => import("./components/AlbumContext"))
const EditHistoryAlbum = React.lazy(() => import("./components/EditHistoryAlbum"))
const ReviewContext = React.lazy(() => import("./components/ReviewContext"))
const AddReview = React.lazy(() => import("./components/AddReview"))
const EditReview = React.lazy(() => import("./components/EditReview"))
const User = React.lazy(() => import("./components/User"))
const ChangePassword = React.lazy(() => import("./components/ChangePassword"))
const ForgotPassword = React.lazy(() => import("./components/ForgotPassword"))
const Tag = React.lazy(() => import("./components/Tag"))
const Search = React.lazy(() => import("./components/Search"))
const Contact = React.lazy(() => import("./components/Contact"))
const Chat = React.lazy(() => import("./components/Chat"))
import Loading from "./components/Loading"
import FlashMessages from "./components/FlashMessages"

function Main() {
  const initialState = {
    siteName: "VibeRates",
    loggedIn: Boolean(localStorage.getItem("viberatesToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("viberatesToken"),
      _id: localStorage.getItem("viberatesUserId"),
      username: localStorage.getItem("viberatesUsername"),
      slug: localStorage.getItem("viberatesUserSlug"),
      email: localStorage.getItem("viberatesUserEmail"),
      type: JSON.parse(localStorage.getItem("viberatesUserType")),
      suspended: JSON.parse(localStorage.getItem("viberatesUserSuspended")),
      image: localStorage.getItem("viberatesUserImage")
    },
    searchOpen: false,
    size: "small"
  }

  const [state, dispatch] = useImmerReducer(Reducer, initialState)

  useEffect(() => {
    window.addEventListener("resize", _.debounce(setWidth, 100))
    setWidth()

    return () => window.removeEventListener("resize", setWidth)
  }, [])

  function setWidth() {
    const w = window.innerWidth
    if (w < 360) {
      dispatch({type: "setSize", value: "tiny"})
    } else if (w >= 360 && w < 720) {
      dispatch({type: "setSize", value: "small"})
    } else if (w >= 720 && w < 1080) {
      dispatch({type: "setSize", value: "medium"})
    } else if (w >= 1080 && w < 1440) {
      dispatch({type: "setSize", value: "large"})
    } else if (w >= 1440) {
      dispatch({type: "setSize", value: "huge"})
    }
  }

  useEffect(() => {
    if (state.searchOpen) {
      document.querySelector("body").classList.add("noscroll")
    } else {
      document.querySelector("body").classList.remove("noscroll")
    }
  }, [state.searchOpen])

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("viberatesToken", state.user.token)
      localStorage.setItem("viberatesUsername", state.user.username)
      localStorage.setItem("viberatesUserSlug", state.user.slug)
      localStorage.setItem("viberatesUserEmail", state.user.email)
      localStorage.setItem("viberatesUserId", state.user._id)
      localStorage.setItem("viberatesUserImage", state.user.image)
      localStorage.setItem("viberatesUserType", JSON.stringify(state.user.type))
      localStorage.setItem("viberatesUserSuspended", JSON.stringify(state.user.suspended))
    } else {
      localStorage.removeItem("viberatesToken")
      localStorage.removeItem("viberatesUsername")
      localStorage.removeItem("viberatesUserSlug")
      localStorage.removeItem("viberatesUserEmail")
      localStorage.removeItem("viberatesUserId")
      localStorage.removeItem("viberatesUserType")
      localStorage.removeItem("viberatesUserSuspended")
      localStorage.removeItem("viberatesUserImage")
    }
  }, [state.loggedIn])

  //Check if token has expired on first render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", {token: state.user.token}, {cancelToken: ourRequest.token})

          if (!response.data) {
            dispatch({type: "logout"})
            dispatch({type: "flashMessage", value: "Your session has expired - please log in again."})
          }
        } catch (e) {
          console.log(e)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <Header />
          <Suspense fallback={<Loading className="align-start" />}>
            <Switch>
              <Route path="/" exact>
                <Home />
              </Route>
              <Route path="/hot-albums" exact>
                <HotAlbums />
              </Route>
              <Route path="/top-rated" exact>
                <TopRated />
              </Route>
              <Route path="/new-releases" exact>
                <NewReleases />
              </Route>
              <Route path="/top-users" exact>
                <TopUsers />
              </Route>
              <Route path="/recent-reviews" exact>
                <RecentReviews />
              </Route>
              <Route path="/user/:slug">
                <User />
              </Route>
              <Route path="/change-password">
                <ChangePassword />
              </Route>
              <Route path="/forgot-password">
                <ForgotPassword />
              </Route>
              <Route path="/add-artist" exact>
                <AddArtist />
              </Route>
              <Route path="/history/:artist" exact>
                <EditHistoryArtist />
              </Route>
              <Route path="/music/:artist" exact>
                <ArtistContext />
              </Route>
              <Route path="/history/:artist/:album" exact>
                <EditHistoryAlbum />
              </Route>
              <Route path="/music/:artist/:album" exact>
                <AlbumContext />
              </Route>
              <Route path="/music/:artist/:album/:review" exact>
                <ReviewContext />
              </Route>
              <Route path="/tag/:tag" exact>
                <Tag />
              </Route>
              <Route path="/contact" exact>
                <Contact />
              </Route>
              <Route path="/chat" exact>
                <Chat />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={250} in={state.searchOpen} classNames="search" unmountOnExit>
            <div className="search">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Footer />
          <FlashMessages />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

if (module.hot) {
  module.hot.accept()
}
