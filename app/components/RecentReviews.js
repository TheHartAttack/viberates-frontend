import React, {useEffect} from "react"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"

//Components
import Loading from "./Loading"
import Page from "./Page"
import ReviewTile from "./ReviewTile"

function RecentReviews() {
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    reviews: [],
    moreReviews: false,
    loading: true,
    buttonLoading: false
  })

  useEffect(() => {
    async function getRecentReviews() {
      cancelPreviousRequest()
      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.post(
          "/recent-reviews",
          {
            offset: 0
          },
          {cancelToken: newCancelToken()}
        )

        if (response.data.success) {
          response.data.reviews.map(review => {
            review.date = new Date(review.date)
          })

          setState(draft => {
            draft.reviews = response.data.reviews
            draft.moreReviews = response.data.moreReviews
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
    getRecentReviews()
  }, [])

  async function loadMore() {
    try {
      setState(draft => {
        draft.buttonLoading = true
      })
      const response = await Axios.post("/recent-reviews", {
        offset: state.reviews.length
      })

      console.log(response.data)

      if (response.data.success) {
        response.data.reviews.map(review => {
          review.date = new Date(review.date)
        })

        setState(draft => {
          draft.reviews = state.reviews.concat(response.data.reviews)
          draft.moreReviews = response.data.moreReviews
          draft.buttonLoading = false
        })
      } else {
        console.log(e)
        setState(draft => {
          draft.buttonLoading = false
        })
      }
    } catch (e) {
      console.log(e)
      setState(draft => {
        draft.buttonLoading = false
      })
    }
  }

  return (
    <Page title="Recent Reviews">
      <div className="recent-reviews">
        <div className="recent-reviews__header">
          <h2 className="recent-reviews__title">Recent Reviews</h2>
        </div>

        {state.loading && <Loading />}

        {!state.loading && (
          <div className="recent-reviews__body recent-reviews__body--3-col">
            {state.reviews.map(review => {
              return <ReviewTile review={review} key={review._id} />
            })}
          </div>
        )}

        {state.moreReviews && (
          <button onClick={loadMore} className="recent-reviews__more" disabled={state.buttonLoading}>
            {state.buttonLoading ? <Loading fontSize="14" /> : "Load more"}
          </button>
        )}
      </div>
    </Page>
  )
}

export default RecentReviews
