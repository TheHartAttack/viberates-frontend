function reviewReducer(draft, action) {
  switch (action.type) {
    case "startLoading":
      draft.loading = true
      return

    case "finishLoading":
      draft.loading = false
      return

    case "setReviewData":
      draft.reviewData = action.data
      return

    case "setReviewSummary":
      draft.reviewData.summary = action.data
      return

    case "setReviewReview":
      draft.reviewData.review = action.data
      return

    case "setReviewRating":
      draft.reviewData.rating = action.data
      return

    case "setReviewTags":
      draft.reviewData.tags = action.data
      return

    case "reviewUpdate":
      draft.updateCount++
      return

    //Edit
    case "openEditReview":
      draft.edit.active = true
      return

    case "closeEditReview":
      draft.edit.active = false
      return

    case "setEditReview":
      draft.edit.summary = action.data.summary
      draft.edit.review = action.data.review
      draft.edit.rating = action.data.rating
      draft.edit.tags = action.data.tags.map(tag => {
        return tag.name
      })
      return

    case "setEditReviewSummary":
      draft.edit.summary = action.data
      return

    case "setEditReviewReview":
      draft.edit.review = action.data
      return

    case "editReviewTagAdd":
      if (draft.edit.tags.length < 3) {
        draft.edit.tags.push(action.data)
      }
      return

    case "editReviewTagRemove":
      draft.edit.tags.splice(action.data, 1)
      return

    case "setEditReviewRating":
      draft.edit.rating = action.data
      return

    case "submitEditReview":
      draft.edit.submitCount++
      return

    case "editReviewStartSubmitting":
      draft.edit.submitting = true
      return

    case "editReviewFinishSubmitting":
      draft.edit.submitting = false
      return

    //Likes
    case "addLike":
      draft.reviewData.likes.push(action.data)
      return

    case "removeLike":
      draft.reviewData.likes = draft.reviewData.likes.filter(like => {
        return like != action.data
      })
      return

    //Comments
    case "addComment":
      draft.reviewData.comments.unshift(action.data)
      return

    case "openEditComment":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data._id) {
          comment.edit.body = comment.comment
          comment.edit.open = true
        }
      }
      return

    case "closeEditComment":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data._id) {
          comment.edit.body = ""
          comment.edit.open = false
        }
      }
      return

    case "setEditBody":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.target._id) {
          comment.edit.body = action.value
        }
      }
      return

    case "startSaving":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data._id) {
          comment.edit.submitting = true
        }
      }
      return

    case "finishSaving":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data._id) {
          comment.edit.submitting = false
        }
      }
      return

    case "saveEditComment":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data._id) {
          comment.comment = comment.edit.body
        }
      }
      return

    case "addCommentLike":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data.comment) {
          comment.likes.push(action.data.user)
        }
      }
      return

    case "removeCommentLike":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data.comment) {
          comment.likes = comment.likes.filter(like => {
            return like != action.data.user
          })
        }
      }
  }
}

export default reviewReducer
