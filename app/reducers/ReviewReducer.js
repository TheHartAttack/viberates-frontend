function reviewReducer(draft, action) {
  switch (action.type) {
    case "startLoading":
      draft.isLoading = true
      return

    case "finishLoading":
      draft.isLoading = false
      return

    case "setReviewData":
      draft.reviewData = action.data
      return

    case "addComment":
      draft.reviewData.comments.unshift(action.data)
      return

    case "addLike":
      draft.reviewData.likes.push(action.data)
      return

    case "removeLike":
      draft.reviewData.likes = draft.reviewData.likes.filter(like => {
        return like != action.data
      })
      return

    case "openEdit":
      for (let comment of draft.reviewData.comments) {
        if (comment._id == action.data._id) {
          comment.edit.body = comment.comment
          comment.edit.open = true
        }
      }
      return

    case "closeEdit":
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

    case "saveEdit":
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
