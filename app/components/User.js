import React, {useEffect, useContext} from "react"
import {Link, useParams, Redirect} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faUser, faKey, faArrowUp, faArrowDown, faBan, faUpload, faTrash, faHeart} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import ReviewTile from "./ReviewTile"

function User() {
  const {slug} = useParams()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    colNum: 1,
    loading: true,
    uploading: false,
    deleting: false,
    handlingMod: false,
    handlingSuspend: false,
    loadingReviews: false,
    userData: {
      _id: "",
      username: "",
      slug: "",
      image: "",
      type: [],
      suspended: "",
      likes: "",
      reviews: [],
      moreReviews: null
    }
  })

  useEffect(() => {
    if (appState.size == "large" || appState.size == "huge") {
      setState(draft => {
        draft.colNum = 3
      })
    } else if (appState.size == "medium") {
      setState(draft => {
        draft.colNum = 2
      })
    } else {
      setState(draft => {
        draft.colNum = 1
      })
    }
  }, [appState.size])

  useEffect(() => {
    async function fetchData() {
      cancelPreviousRequest()
      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.get(`/user/${slug}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          for (let review of response.data.user.reviews) {
            review.date = new Date(review.date)
          }

          setState(draft => {
            draft.userData = response.data.user
            draft.loading = false
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
    fetchData()
  }, [slug])

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  if (!state.loading && state.userData._id == "") {
    return <Redirect to="/" />
  }

  async function handleSuspend() {
    cancelPreviousRequest()
    if (!state.handlingSuspend) {
      try {
        setState(draft => {
          draft.handlingSuspend = true
        })
        const response = await Axios.post(`/suspend/${slug}`, {token: appState.user.token}, {cancelToken: newCancelToken()})

        if (response.data.success) {
          if (response.data.status == "suspended") {
            setState(draft => {
              draft.userData.suspended = true
              draft.handlingSuspend = false
            })
            appDispatch({type: "flashMessage", value: response.data.message})
          }

          if (response.data.status == "unsuspended") {
            setState(draft => {
              draft.userData.suspended = false
              draft.handlingSuspend = false
            })
            appDispatch({type: "flashMessage", value: response.data.message})
          }
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
          draft.handlingSuspend = false
        })
      }
    }
  }

  async function handleMod() {
    cancelPreviousRequest()
    if (!state.handlingMod) {
      try {
        setState(draft => {
          draft.handlingMod = true
        })
        const response = await Axios.post(`/mod/${slug}`, {token: appState.user.token}, {cancelToken: newCancelToken()})

        if (response.data.success) {
          if (response.data.status == "modded") {
            setState(draft => {
              draft.userData.type.push("mod")
              draft.handlingMod = false
            })
            appDispatch({type: "flashMessage", value: response.data.message})
          }

          if (response.data.status == "unmodded") {
            setState(draft => {
              draft.userData.type = state.userData.type.filter(userType => {
                return userType != "mod"
              })
              draft.handlingMod = false
            })
            appDispatch({type: "flashMessage", value: response.data.message})
          }
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
          draft.handlingMod = false
        })
      }
    }
  }

  async function handleUpload(e) {
    cancelPreviousRequest()
    if (!state.uploading) {
      try {
        setState(draft => {
          draft.uploading = true
        })
        const formData = new FormData()
        formData.append("image", e.target.files[0])
        const response = await Axios.post(`/edit/user/${state.userData._id}/image`, formData, {cancelToken: newCancelToken(), headers: {"Content-Type": "multipart/form-data", authorization: appState.user.token}})

        if (response.data.success) {
          setState(draft => {
            draft.userData.image = response.data.image
            draft.uploading = false
          })
          appDispatch({type: "updateImage", value: response.data.image})
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
          draft.uploading = false
        })
      }
    }
  }

  async function handleDelete() {
    cancelPreviousRequest()
    if (!state.deleting) {
      try {
        setState(draft => {
          draft.deleting = true
        })
        const response = await Axios.delete(`/edit/user/${state.userData._id}/image`, {cancelToken: newCancelToken(), headers: {authorization: appState.user.token}})

        if (response.data.success) {
          setState(draft => {
            draft.userData.image = ""
            draft.deleting = false
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
          draft.deleting = false
        })
      }
    }
  }

  async function loadReviews(e) {
    cancelPreviousRequest()
    try {
      setState(draft => {
        draft.loadingReviews = true
      })
      const response = await Axios.post(`/user/${state.userData._id}/load-reviews`, {offset: state.userData.reviews.length}, {cancelToken: newCancelToken()})

      if (response.data.success) {
        for (const review of response.data.reviews) {
          review.date = new Date(review.date)
        }

        setState(draft => {
          draft.userData.reviews = state.userData.reviews.concat(response.data.reviews)
          draft.userData.moreReviews = response.data.moreReviews
          draft.loadingReviews = false
        })
      } else {
        throw new Error(response.data.message)
      }
    } catch (e) {
      if (isCancel(e)) {
        console.log(e)
        return
      }
      appDispatch({type: "flashMessage", warning: true, value: e.message})
      setState(draft => {
        draft.loadingReviews = false
      })
      console.log(e)
    }
  }

  return (
    <Page title={state.userData.username}>
      <div className="user-profile">
        <div className="user-image">
          {state.userData.image ? <img src={state.userData.image} alt="" /> : <FontAwesomeIcon icon={faUser} />}
          {state.userData._id == appState.user._id && !state.uploading && (
            <div className="user-image__upload">
              <label htmlFor="user-image-input" className="user-image__button">
                <FontAwesomeIcon icon={faUpload} />
              </label>
              <input type="file" onChange={e => handleUpload(e)} id="user-image-input" className="user-image__input" />
              <button onClick={handleDelete} type="button" className="user-image__delete user-image__button">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          )}
          {state.userData._id == appState.user._id && state.uploading && (
            <div className="user-image__loading">
              <Loading />
            </div>
          )}
        </div>

        <div className="user-profile__info">
          <h2 className="user-profile__username">{state.userData.username}</h2>
          <span className="user-profile__likes">
            {state.userData.likes}
            <FontAwesomeIcon icon={faHeart} />
          </span>
        </div>

        {appState.loggedIn && (
          <ul className="user-profile__links">
            {state.userData._id == appState.user._id && (
              <li className="user-profile__link">
                <Link to="/change-password" className="user-profile__button button">
                  Change password <FontAwesomeIcon icon={faKey} />
                </Link>
              </li>
            )}

            {(appState.user.type.includes("admin") || appState.user.type.includes("mod")) && appState.user._id != state.userData._id && (
              <li className="user-profile__link">
                <button onClick={handleSuspend} className="user-profile__button button" disabled={state.handlingSuspend ? "disabled" : ""}>
                  {state.handlingSuspend ? <Loading fontSize="12" firstCol={true} /> : state.userData.suspended ? "Unsuspend" : "Suspend"} <FontAwesomeIcon icon={faBan} />
                </button>
              </li>
            )}

            {appState.user.type.includes("admin") && !state.userData.type.includes("admin") && appState.user._id != state.userData._id && (
              <li className="user-profile__link">
                <button onClick={handleMod} className="user-profile__button button" disabled={state.handlingMod ? "disabled" : ""}>
                  {state.handlingMod ? <Loading fontSize="12" firstCol={true} /> : state.userData.type.includes("mod") ? "Demote from mod" : "Promote to mod"} <FontAwesomeIcon icon={state.userData.type.includes("mod") ? faArrowDown : faArrowUp} />
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="user-reviews">
        <div className="user-reviews__column">
          {state.userData.reviews.map((review, index) => {
            if (index % state.colNum == 0) {
              return <ReviewTile key={review._id} review={review} page="user" />
            }
          })}
        </div>

        {(appState.size == "medium" || appState.size == "large" || appState.size == "huge") && (
          <div className="user-reviews__column">
            {state.userData.reviews.map((review, index) => {
              if (index % state.colNum == 1) {
                return <ReviewTile key={review._id} review={review} page="user" />
              }
            })}
          </div>
        )}

        {(appState.size == "large" || appState.size == "huge") && (
          <div className="user-reviews__column">
            {state.userData.reviews.map((review, index) => {
              if (index % state.colNum == 2) {
                return <ReviewTile key={review._id} review={review} page="user" />
              }
            })}
          </div>
        )}

        {state.userData.moreReviews && !state.loadingReviews && (
          <button onClick={loadReviews} className="user-reviews__load">
            See more reviews
          </button>
        )}

        {state.userData.moreReviews && state.loadingReviews && <Loading fontSize="20" className="user-reviews__loading" />}
      </div>
    </Page>
  )
}

export default User
