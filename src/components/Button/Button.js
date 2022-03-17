import { useState } from "react"

export default ({
  isLoading,
  textLoading,
  onClick,
  children,
}) => {
  return (
    <button onClick={onClick} disabled={isLoading}>
      { isLoading && textLoading }

      { !isLoading && children }
    </button>
  )
}