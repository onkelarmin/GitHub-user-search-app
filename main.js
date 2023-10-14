import { Octokit, App } from 'https://esm.sh/octokit'

// Theme switch

const body = document.body
const themeName = document.querySelector('.theme-name')
const themeToggle = document.querySelector('.theme-toggle')

themeToggle.addEventListener('change', () => {
  if (body.classList.contains('dark')) {
    setTheme('light')
    saveTheme('light')
  } else {
    setTheme('dark')
    saveTheme('dark')
  }
})

function setTheme(theme) {
  body.classList.remove('dark', 'light')
  body.classList.add(theme)
  themeName.innerText = theme === 'dark' ? 'light' : 'dark'
}

function saveTheme(theme) {
  localStorage.setItem('theme', theme)
}

function loadTheme() {
  const themeStored = localStorage.getItem('theme') === null ? false : true

  if (themeStored) {
    const theme = localStorage.getItem('theme')
    setTheme(theme)
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark')
  } else setTheme('light')
}

loadTheme()

// Search functionality

const searchForm = document.querySelector('.search-form')
const inputField = document.querySelector('#search')
const errorEl = document.querySelector('.error')

const userPicture = document.querySelector('.user-picture')
const userName = document.querySelector('.user-name')
const userGithubLink = document.querySelector('.github-link')
const userJoined = document.querySelector('.joined')
const userBio = document.querySelector('.bio')
const userRepos = document.querySelector('.stat[data-stat="repos"] .value')
const userFollowers = document.querySelector(
  '.stat[data-stat="followers"] .value'
)
const userFollowing = document.querySelector(
  '.stat[data-stat="following"] .value'
)
const userLocation = document.querySelector(
  '.link[data-type="location"] .link-content'
)
const userTwitter = document.querySelector(
  '.link[data-type="twitter"] .link-content'
)
const userWebsite = document.querySelector(
  '.link[data-type="website"] .link-content'
)
const userCompany = document.querySelector(
  '.link[data-type="company"] .link-content'
)

const octokit = new Octokit({
  userAgent: 'my-app/v1.2.3',
})

searchForm.addEventListener('submit', (e) => {
  e.preventDefault()
  errorEl.setAttribute('hidden', '')

  const input = inputField.value

  handleInput(input)
})

async function handleInput(username) {
  try {
    const res = await octokit.request('GET /users/{username}', {
      username: username,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    const data = res.data

    renderUser(data)
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      )
    }
    renderError()
  }
}

function renderUser(userData) {
  const {
    name,
    login,
    bio,
    created_at,
    html_url,
    avatar_url,
    public_repos,
    followers,
    following,
    location,
    twitter_username,
    blog,
    company,
  } = userData

  userPicture.setAttribute('src', avatar_url)
  userName.innerText = name ? name : login
  userGithubLink.innerText = `@${login}`
  userGithubLink.setAttribute('href', html_url)
  userJoined.innerText = `Joined ${formatDate(created_at)}`
  userBio.innerText = bio ? bio : 'This profile has no bio'

  userRepos.innerText = public_repos
  userFollowers.innerText = followers
  userFollowing.innerText = following

  renderLink(userLocation, location)
  renderLink(userTwitter, twitter_username)
  renderLink(userCompany, company)
  renderLink(userWebsite, blog)
  if (!blog) {
    userWebsite.setAttribute('tabindex', '-1')
  } else {
    userWebsite.setAttribute('tabindex', '')
  }
}

function renderError() {
  errorEl.removeAttribute('hidden')
}

function formatDate(dateStr) {
  const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Otc',
    'Nov',
    'Dec',
  ]

  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = MONTHS[date.getMonth()]
  const day = date.getDate()

  const str = `${day} ${month} ${year} `

  return str
}

function renderLink(element, value) {
  if (value === null || value === '') {
    element.closest('.link').setAttribute('aria-disabled', true)
    element.innerText = 'Not Available'
  } else {
    element.closest('.link').setAttribute('aria-disabled', false)
    element.innerText = value
  }
}

// Init
handleInput('octocat')
inputField.value = ''
