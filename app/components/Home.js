import React, {useEffect, useContext} from "react"
import {Link} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowRight} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"

//Components
import Loading from "./Loading"
import Page from "./Page"
import Register from "./Register"
import AlbumTile from "./AlbumTile"
import ReviewTile from "./ReviewTile"
import UserTile from "./UserTile"

function Home(props) {
  const appState = useContext(StateContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    recentReviews: [],
    hotAlbums: [],
    topRated: [],
    newReleases: [],
    topUsers: [],
    loading: true
  })

  useEffect(() => {
    async function getHome() {
      cancelPreviousRequest()

      try {
        const response = await Axios.get("/home", {cancelToken: newCancelToken()})

        if (response.data.success) {
          response.data.recentReviews.reviews.map(review => {
            review.date = new Date(review.date)
          })

          setState(draft => {
            draft.loading = false
            draft.recentReviews = response.data.recentReviews.reviews
            draft.topRated = response.data.topRated.albums
            draft.newReleases = response.data.newReleases.albums
            draft.hotAlbums = response.data.hotAlbums.albums
            draft.topUsers = response.data.topUsers.users
          })
        } else {
          throw new Error(response.data.message)
        }
      } catch (e) {
        if (isCancel(e)) {
          console.log(e)
          return
        }
        appDispatch({type: "flashMessage", value: e.message, warning: true})
        console.log(e)
        setState(draft => {
          draft.loading = false
        })
      }
    }
    getHome()
  }, [])

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  return (
    <Page>
      <div className="home home--left">
        {appState.loggedIn ? "" : <Register />}

        <div className="home-section home-section--sidebar home-section--reviews">
          <div className="home-section__header">
            <h2 className="home-section__title">Recent Reviews</h2>
            <Link to="/recent-reviews" className="home-section__view-all-link">
              View all
            </Link>
          </div>

          {state.recentReviews.map((review, index) => {
            return <ReviewTile review={review} key={review._id} />
          })}
        </div>

        <div className="home-section home-section--sidebar">
          <ul className="home__links">
            {appState.loggedIn && (
              <li>
                <Link to="/add-artist" className="home__link">
                  Add artist to database
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </li>
            )}
            {appState.loggedIn && (
              <li>
                <Link to="/contact" className="home__link">
                  Contact admin
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="home home--right">
        <div className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">Hot Albums</h2>
            <Link to="/hot-albums" className="home-section__view-all-link">
              View all
            </Link>
          </div>

          {state.hotAlbums.map(album => {
            return <AlbumTile album={album} key={album._id} />
          })}
        </div>

        <div className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">Top Rated</h2>
            <Link to="/top-rated" className="home-section__view-all-link">
              View all
            </Link>
          </div>

          {state.topRated.map(album => {
            return <AlbumTile album={album} key={album._id} />
          })}
        </div>

        <div className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">New Releases</h2>
            <Link to="/new-releases" className="home-section__view-all-link">
              View all
            </Link>
          </div>

          {state.newReleases.map(album => {
            return <AlbumTile album={album} key={album._id} />
          })}
        </div>

        <div className="home-section home-section--user">
          <div className="home-section__header">
            <h2 className="home-section__title">Top Users</h2>
            <Link to="/top-users" className="home-section__view-all-link">
              View all
            </Link>
          </div>

          {state.topUsers.map(user => {
            return <UserTile user={user} key={user._id} />
          })}
        </div>
      </div>
    </Page>
  )
}

export default Home
