function albumProfileReducer(draft, action) {
  switch (action.type) {
    case "startLoading":
      draft.isLoading = true
      return

    case "finishLoading":
      draft.isLoading = false
      return

    case "setAlbumTitle":
      draft.albumData.title = action.data
      return

    case "setAlbumSlug":
      draft.albumData.slug = action.data
      return

    case "setAlbumReleaseDate":
      draft.albumData.releaseDate = action.data
      return

    case "setAlbumType":
      draft.albumData.type = action.data
      return

    case "setAlbumPreview":
      draft.albumData.preview = action.data
      return

    case "setAlbumImage":
      draft.albumData.image = action.data
      return

    case "setAlbumTracklist":
      draft.albumData.tracklist = action.data
      return

    case "setAlbumRating":
      draft.albumData.rating = action.data
      return

    case "setAlbumTags":
      draft.albumData.tags = action.data
      return

    case "userHasReviewed":
      draft.userHasReviewed = action.data
      return

    case "userHasNotReviewed":
      draft.userHasReviewed = null
      return

    //Edit Album
    case "startEditing":
      draft.edit.active = true
      return

    case "finishEditing":
      draft.edit.active = false
      return

    case "submit":
      draft.edit.submitCount++
      return

    case "startSubmitting":
      draft.edit.submitting = true
      return

    case "finishSubmitting":
      draft.edit.submitting = false
      return

    case "setEditTitle":
      draft.edit.title = action.data
      return

    case "setEditReleaseDate":
      draft.edit.releaseDate = action.data
      return

    case "setEditType":
      draft.edit.type = action.data
      return

    case "setEditPreview":
      draft.edit.preview = action.data
      return

    case "setEditImage":
      draft.edit.image = action.data
      return

    case "setEditTracklist":
      draft.edit.tracklist = action.data
      return

    case "editTracklistAdd":
      draft.edit.tracklist.push(action.data)
      return

    case "editTracklistRemove":
      draft.edit.tracklist.splice(action.data, 1)
      return

    case "editTracklistReorder":
      const [track] = draft.edit.tracklist.splice(action.sourceIndex, 1)
      draft.edit.tracklist.splice(action.destIndex, 0, track)
      return

    //Add Review
    case "startAddReview":
      draft.addReview.active = true
      return

    case "finishAddReview":
      draft.addReview.active = false
      draft.addReview.summary = ""
      draft.addReview.review = ""
      draft.addReview.rating = 1
      draft.addReview.tags = []
      return

    case "submitAddReview":
      draft.addReview.submitCount++
      return

    case "addReviewStartSubmitting":
      draft.addReview.submitting = true
      return

    case "addReviewFinishSubmitting":
      draft.addReview.submitting = false
      return

    case "setAddReviewSummary":
      draft.addReview.summary = action.data
      return

    case "setAddReviewReview":
      draft.addReview.review = action.data
      return

    case "addReviewTagAdd":
      if (draft.addReview.tags.length < 3) {
        draft.addReview.tags.push(action.data)
      }
      return

    case "addReviewTagRemove":
      draft.addReview.tags.splice(action.data, 1)
      return

    case "setAddReviewRating":
      draft.addReview.rating = action.data
      return
  }
}

export default albumProfileReducer
