defmodule PartyGameWeb.CoreComponents do
  use Phoenix.Component

  #import PartyGameWeb.Gettext

  def logo(assigns) do
    ~H"""
    <svg class="app-logo bouncy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve">
      <title>Logo</title>
      <path style="fill:#2d527c" d="M327.637 512c-7.876 0-14.262-6.385-14.262-14.262V380.984c0-7.877 6.387-14.262 14.262-14.262 7.876 0 14.262 6.385 14.262 14.262v116.754c.001 7.877-6.386 14.262-14.262 14.262zM327.637 340.529c-56.467 0-107.823-33.332-130.834-84.918-3.209-7.192.021-15.626 7.215-18.835s15.626.021 18.836 7.215c18.431 41.316 59.562 68.013 104.784 68.013 7.876 0 14.262 6.385 14.262 14.262.001 7.878-6.387 14.263-14.263 14.263zM456.577 211.586c-7.876 0-14.262-6.385-14.262-14.262 0-63.234-51.444-114.679-114.678-114.679-9.363 0-18.695 1.138-27.736 3.383-7.642 1.894-15.379-2.761-17.277-10.406s2.761-15.38 10.406-17.279a143.808 143.808 0 0 1 34.609-4.222c78.961 0 143.202 64.241 143.202 143.203-.002 7.877-6.388 14.262-14.264 14.262z"/>
      <path style="fill:#2d527c" d="M327.637 395.246c-14.589 0-28.423-3.111-38.957-8.758-14.295-7.664-22.169-19.656-22.169-33.767 0-9.667 4.426-21.854 13.927-38.354a14.256 14.256 0 0 1 16.206-6.616 114.942 114.942 0 0 0 30.993 4.254c7.876 0 14.262 6.385 14.262 14.262s-6.387 14.262-14.262 14.262c-9.23 0-18.424-.889-27.456-2.648-4.843 9.885-5.146 13.978-5.146 14.84 0 7.589 14.93 14.001 32.602 14.001s32.6-6.412 32.6-14.001c0-7.877 6.387-14.262 14.262-14.262 7.876 0 14.262 6.385 14.262 14.262.001 25.038-25.134 42.525-61.124 42.525zM184.363 457.879c-7.876 0-14.262-6.385-14.262-14.262v-130.63c0-7.877 6.387-14.262 14.262-14.262s14.262 6.385 14.262 14.262v130.63c0 7.877-6.387 14.262-14.262 14.262z"/>
      <path style="fill:#cee8fa" d="M137.497 298.6c0-23.431 46.864-81.17 46.864-81.17s46.864 57.739 46.864 81.17c0 37.685-93.728 37.685-93.728 0z"/>
      <path style="fill:#2d527c" d="M184.361 341.125c-35.989 0-61.125-17.488-61.125-42.525 0-26.438 38.311-75.692 50.053-90.16a14.267 14.267 0 0 1 22.15 0c11.741 14.466 50.052 63.722 50.052 90.158-.004 25.039-25.139 42.527-61.13 42.527zm.002-100.4c-17.227 23.27-32.602 48.824-32.602 57.874 0 7.589 14.93 14.001 32.6 14.001 17.674 0 32.602-6.412 32.602-14.001 0-9.05-15.373-34.604-32.6-57.874z"/>
      <circle style="fill:#cee8fa" cx="184.365" cy="143.206" r="128.944"/>
      <path style="fill:#2d527c" d="M184.363 286.407c-78.962 0-143.203-64.241-143.203-143.203S105.399 0 184.363 0s143.203 64.241 143.203 143.203-64.241 143.204-143.203 143.204zm0-257.883c-63.234 0-114.679 51.445-114.679 114.679s51.445 114.679 114.679 114.679 114.679-51.445 114.679-114.679S247.595 28.524 184.363 28.524z"/>
    </svg>
    """
  end
end
