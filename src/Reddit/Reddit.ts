import { ExecutionContext } from 'ava'
import { setStyles } from '../helpers'

/*
 * LipSurf plugin for Reddit.com
 */
/// <reference types="@lipsurf/types/extension"/>
declare const PluginBase: IPluginBase

type Maybe<T> = T | null

const thingAttr = `${ PluginBase.util.getNoCollisionUniqueAttr() }-thing`
const COMMENTS_REGX = /reddit.com\/r\/[^\/]*\/comments\//
const isOldReddit = /https:\/\/old/.test(window.location.href)

let scrollContainer: Maybe<ParentNode> = null
let observer: Maybe<MutationObserver> = null
let posts: Maybe<NodeList> = null
let index = 0

const reddit = {
  old: {
    post: {
      thing: '#siteTable>div.thing',
      title: 'a.title',
      comments: 'a.comments'
    },
    vote: {
      btn: '#siteTable *[role="button"]',
      up: '.arrow.up:not(.upmod)',
      down: '.arrow.down:not(.downmod)',
      upmod: '.arrow.upmod',
      downmod: '.arrow.downmod',
    }
  },
  last: {
    post: {
      thing: '.Post',
      comments: 'a[data-click-id="comments"]'
    },
    vote: {
      btn: '.voteButton',
      up: '.voteButton[aria-label="upvote"]',
      down: '.voteButton[aria-label="downvote"]',
      pressed: '.voteButton[aria-pressed="true"]',
      unpressed: '.voteButton[aria-pressed="false"]',
    }
  }
}

function thingAtIndex(i: number): string {
  if (isOldReddit) {
    return `${ reddit.old.post.thing }[${ thingAttr }="${ i }"]`
  } else {
    return `${ reddit.last.post.thing }[${ thingAttr }="${ i }"]`
  }
}

function clickIfExists(selector: string) {
  const el = document.querySelector<HTMLElement>(selector)
  if (el) el.click()
}

function genPostNumberElement(number): HTMLElement {
  const span = document.createElement('span')
  span.textContent = number

  setStyles({
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    fontWeight: 700,
    opacity: .3
  }, span)

  return span
}

function addOldRedditPostsAttributes(posts) {
  posts.forEach((el) => {
    index += 1
    el.setAttribute(thingAttr, `${ index }`)
    const rank = <HTMLElement> el.querySelector('.rank')

    setStyles({
      display: 'block',
      marginRight: '10px',
      opacity: '1 !important'
    }, rank)
  })
}

function setAttributes(post: HTMLElement) {
  if (post && getComputedStyle(post).display !== 'none') {
    index += 1
    post.setAttribute(thingAttr, `${ index }`)
    post.style.position = 'relative'
    post.appendChild(genPostNumberElement(index))
  }
}

function addNewRedditPostsAttributes(posts) {
  posts.forEach(setAttributes)
}

function observerCallback(mutationList) {
  const { old, last } = reddit
  const postSelector = isOldReddit ? old.post : last.post

  mutationList.forEach(it => {
    it.addedNodes.forEach(node => {
      const post = node.querySelector(postSelector)
      setAttributes(post)
    })
  })
}

function createObserver(el: ParentNode) {
  observer = new MutationObserver(observerCallback)
  observer.observe(el!, { childList: true })
}

function setParentContainer(posts) {
  // hard way to posts container
  return posts![0].parentNode!.parentNode!.parentNode
}

function detectPosts() {
  const { old, last } = reddit
  const postSelector = isOldReddit ? old.post.thing : last.post.thing

  posts = document.querySelectorAll<HTMLElement>(postSelector)

  if (isOldReddit) {
    addOldRedditPostsAttributes(posts)
  } else {
    scrollContainer = setParentContainer(posts)
    createObserver(scrollContainer!)
    addNewRedditPostsAttributes(posts)
  }
}

function composeVoteSelector(index, cmd) {
  const { old, last } = reddit
  const selector = isOldReddit ? old.vote[cmd] : last.vote[cmd]

  if (index) return `${ thingAtIndex(index) } ${ selector }`

  return selector
}

function composeClearVoteSelector(index): string {
  const { old, last } = reddit
  const thing = thingAtIndex(index)

  if (index && isOldReddit) {
    return `${ thing } ${ old.vote.downmod }, ${ thing } ${ old.vote.upmod }`
  }

  if (!index && isOldReddit) {
    return `${ old.vote.downmod },${ old.vote.upmod }`
  }

  if (index && !isOldReddit) {
    return `${ thing } ${ last.vote.pressed }`
  }

  return last.vote.pressed
}

function vote(type: 'up' | 'down' | 'clear', index?: number) {
  let q = ''

  if (type === 'up') q = composeVoteSelector(index, 'up')
  if (type === 'down') q = composeVoteSelector(index, 'down')
  if (type === 'clear') q = composeClearVoteSelector(index)

  clickIfExists(q)
}

export default <IPluginBase & IPlugin> {
  ...PluginBase,
  ...{
    niceName: 'Reddit',
    description: 'Commands for Reddit.com',
    version: '4.4.0',
    apiVersion: 2,
    match: /^https?:\/\/.*\.reddit.com/,
    authors: 'Miko',

    // less common -> common
    homophones: {
      navigate: 'go',
      contract: 'collapse',
      claps: 'collapse',
      expense: 'expand',
      explain: 'expand',
      expanding: 'expand',
      'expand noun': 'expand 9',
      'it\'s been': 'expand',
      expanse: 'expand',
      expanded: 'expand',
      stand: 'expand',
      xpand: 'expand',
      xmen: 'expand',
      spend: 'expand',
      span: 'expand',
      spell: 'expand',
      spent: 'expand',
      'reddit dot com': 'reddit',
      'read it': 'reddit',
      shrink: 'collapse',
      advert: 'upvote',
      download: 'downvote',
      commence: 'comments',
      what: 'upvote',
    },

    contexts: {
      'Post List': {
        commands: [
          'View Comments',
          'Visit Post',
          'Expand',
          'Collapse',
          'Upvote',
          'Downvote',
          'Clear Vote',
        ],
      },
      Post: {
        commands: [
          'Upvote Current',
          'Downvote Current',
          'Clear Vote Current',
          'Visit Current',
          'Expand Current',
          'Collapse Current',
          'Expand All Comments',
        ],
      },
    },

    init: async () => {
      if (document.location.hostname.endsWith('reddit.com')) {
        console.log('init')

        if (COMMENTS_REGX.test(document.location.href)) {
          PluginBase.util.prependContext('Post')
          PluginBase.util.removeContext('Post List')
        } else {
          PluginBase.util.prependContext('Post List')
          PluginBase.util.removeContext('Post')
        }

        await PluginBase.util.ready()

        // waiting for DOM loading in timeout
        // we can't use "load" event listener, because
        // the extension can be enabled after DOM loading
        // window.addEventListener('load', detectPosts)
        // detectPosts()

        setTimeout(() => {
          console.log('timer')
          detectPosts()
        }, 2000)
      }
    },

    destroy: () => {
      PluginBase.util.removeContext('Post List', 'Post')
      observer && observer!.disconnect()
    },

    commands: [
      {
        name: 'Go to Reddit',
        global: true,
        match: [ '[/go to ]reddit' ],
        minConfidence: 0.5,
        pageFn: () => {
          document.location.href = 'https://old.reddit.com'
        },
      },
      {
        name: 'Go to Subreddit',
        match: {
          fn: ({ normTs, preTs }) => {
            const SUBREDDIT_REGX = /\b(?:go to |show )?(?:are|our|r) (.*)/
            let match = preTs.match(SUBREDDIT_REGX)
            // console.log(`navigate subreddit input: ${input} match: ${match}`);
            if (match) {
              const endPos = match.index! + match[0].length
              return [ match.index, endPos, [ match[1].replace(/\s/g, '') ] ]
            }
          },
          description: 'go to/show r [subreddit name] (do not say slash)',
        },
        isFinal: true,
        nice: (transcript, matchOutput: string) => {
          return `go to r/${ matchOutput }`
        },
        pageFn: (transcript, subredditName: string) => {
          window.location.href = `https://old.reddit.com/r/${ subredditName }`
        },
      },
      {
        name: 'View Comments',
        description: 'View the comments of a reddit post.',
        match: [ 'comments #', '# comments' ],
        normal: false,
        pageFn: (transcript, index: number) => {
          const selector = isOldReddit ? ` ${ reddit.old.post.comments }` : ` ${ reddit.last.post.comments }`
          clickIfExists(thingAtIndex(index) + selector)
        },
      },
      {
        name: 'Visit Post',
        description: 'Equivalent of clicking a reddit post.',
        match: [ 'visit #', '# visit' ],
        normal: false,
        pageFn: (transcript, index: number) => {
          const selector = isOldReddit ? ` ${ reddit.old.post.title }` : reddit.last.post.thing
          clickIfExists(thingAtIndex(index) + selector)
        },
      },
      {
        name: 'Expand',
        description:
          'Expand a preview of a post, or a comment by it\'s position (rank).',
        match: [ 'expand #', '# expand' ], // in comments view
        normal: false,
        pageFn: (transcript, index: number) => {
          const el = <HTMLElement> (
            document.querySelector(
              `${ thingAtIndex(index) } .expando-button.collapsed`
            )
          )
          el.click()
          PluginBase.util.scrollToAnimated(el, -25)
        },
        test: async (t: ExecutionContext<ICmdTestContext>, say, client) => {
          await client.url(
            `${ t.context.localPageDomain }/reddit-r-comics.html?fakeUrl=https://www.reddit.com/r/comics`
          )
          const selector = `#thing_t3_dvpn38 > div > div > div.expando-button.collapsed`
          const item = await client.$(selector)
          t.true(await item.isExisting())
          await say('expand for')
          t.true(
            (await item.getAttribute('class')).split(' ').includes('expanded')
          )
        },
      },
      {
        name: 'Collapse',
        description:
          'Collapse an expanded preview (or comment if viewing comments). Defaults to topmost in the view port.',
        match: [ 'collapse #', '# collapse' ],
        normal: false,
        pageFn: (transcript, index: number) => {
          const el = <HTMLElement> (
            document.querySelector(
              thingAtIndex(index) + ' .expando-button:not(.collapsed)'
            )
          )
          el.click()
        },
        test: async (t: ExecutionContext<ICmdTestContext>, say, client) => {
          await client.url(
            'https://old.reddit.com/r/IAmA/comments/z1c9z/i_am_barack_obama_president_of_the_united_states/'
          )

          // await client.driver.wait(client.until.elementIsVisible(client.driver.findElement(client.By.css('.commentarea'))), 1000);
          await client.execute(() => {
            document.querySelector('.commentarea')!.scrollIntoView()
          })
          // make sure it's expanded
          //<div class=" thing id-t1_c60o0iw noncollapsed   comment " id="thing_t1_c60o0iw" onclick="click_thing(this)" data-fullname="t1_c60o0iw" data-type="comment" data-subreddit="IAmA" data-subreddit-fullname="t5_2qzb6" data-author="Biinaryy" data-author-fullname="t2_76bmi"><p class="parent"><a name="c60o0iw"></a></p><div class="midcol unvoted"><div class="arrow up login-required archived access-required" data-event-action="upvote" role="button" aria-label="upvote" tabindex="0"></div><div class="arrow down login-required archived access-required" data-event-action="downvote" role="button" aria-label="downvote" tabindex="0"></div></div><div class="entry unvoted"><p class="tagline"><a href="javascript:void(0)" class="expand" onclick="return togglecomment(this)">[–]</a><a href="https://old.reddit.com/user/Biinaryy" class="author may-blank id-t2_76bmi">Bi

          const commentUnderTest = await client.$(
            '//div[contains(@class, \'noncollapsed\')][contains(@class, \'comment\')][@data-author=\'Biinaryy\']'
          )

          // make sure a child element is visible
          const tierTwoComment = await client.$(
            '//p[contains(text(), \'HE KNOWS\')]'
          )
          // await tierTwoComment.waitForDisplayed()
          t.true(
            await tierTwoComment.isDisplayed(),
            `tier two comment should be visible`
          )
          await say()
          // check that the child comment is no longer visible
          t.true(
            (await commentUnderTest.getAttribute('class')).includes(
              'collapsed'
            ),
            `comment under test needs collapsed class`
          )
          t.false(
            await tierTwoComment.isDisplayed(),
            `tier two comment should not be visible`
          )
        },
      },
      {
        name: 'Upvote',
        match: [ 'upvote #', '# upvote' ],
        description: 'Upvote the post # (doesn\'t work for comments yet)',
        normal: false,
        pageFn: (transcript, index: number) => {
          vote('up', index)
        },
      },
      {
        name: 'Downvote',
        match: [ 'downvote #', '# downvote' ],
        description: 'Downvote the post # (doesn\'t work for comments yet)',
        normal: false,
        pageFn: (transcript, index: number) => {
          vote('down', index)
        },
      },
      {
        name: 'Clear Vote',
        description: 'Unsets the upvote/downvote so it\'s neither up or down.',
        match: [ '[clear/reset] vote #', '# [clear/reset] vote' ],
        normal: false,
        pageFn: (transcript, index: number) => {
          vote('clear', index)
        },
      },
      /* Comments Page */
      {
        name: 'Upvote Current',
        match: 'upvote',
        description: 'Upvote the current post.',
        normal: false,
        pageFn: () => vote('up'),
      },
      {
        name: 'Downvote Current',
        match: 'downvote',
        description: 'Downvote the post # (doesn\'t work for comments yet)',
        normal: false,
        pageFn: () => vote('down'),
      },
      {
        name: 'Clear Vote Current',
        description: 'Unsets the upvote/downvote so it\'s neither up or down.',
        match: [ '[clear/reset] vote' ],
        normal: false,
        pageFn: () => vote('clear'),
      },
      {
        name: 'Visit Current',
        description: 'Click the link for the post that we\'re in.',
        match: 'visit',
        normal: false,
        pageFn: () => clickIfExists('#siteTable p.title a.title'),
      },
      {
        name: 'Expand Current',
        description: 'Expand the post that we\'re in.',
        match: 'expand',
        normal: false,
        pageFn: () => {
          // if expando-button is in frame expand that, otherwise expand first (furthest up) visible comment
          const mainItem = document.querySelector<HTMLAnchorElement>(
            `#siteTable .thing .expando-button.collapsed`
          )
          const commentItems = Array.from(
            document.querySelectorAll<HTMLElement>(
              `.commentarea > div > .thing.collapsed`
            )
          )

          if (mainItem && PluginBase.util.isVisible(mainItem)) {
            mainItem.click()
          } else {
            let el: HTMLElement
            for (el of commentItems.reverse()) {
              if (PluginBase.util.isVisible(el)) {
                el.querySelector<HTMLAnchorElement>(
                  '.comment.collapsed a.expand'
                )!.click()
                return
              }
            }
          }
        },
      },
      {
        name: 'Collapse Current',
        description: 'Collapse the current post that we\'re in.',
        match: [ 'collapse', 'close' ],
        normal: false,
        pageFn: () => {
          // collapse first visible item (can be comment or post)
          for (const el of document.querySelectorAll<HTMLElement>(
            `#siteTable .thing .expando-button.expanded, .commentarea > div > div.thing:not(.collapsed) > div > p > a.expand`
          )) {
            if (PluginBase.util.isVisible(el)) {
              el.click()
              break
            }
          }
        },
      },
      {
        name: 'Expand All Comments',
        description: 'Expands all the comments.',
        match: [ 'expand all[/ comments]' ],
        normal: false,
        pageFn: async () => {
          for (let el of document.querySelectorAll<HTMLElement>(
            '.thing.comment.collapsed a.expand'
          )) {
            el.click()
          }
        },
        test: async (t, say, client) => {
          // Only checks to see that more than 5 comments are collapsed.
          await client.url(
            'https://old.reddit.com/r/OldSchoolCool/comments/2uak5a/arnold_schwarzenegger_flexing_for_two_old_ladies/co6nw85/'
          )
          // first let's make sure there's some collapsed items
          t.truthy(
            (await client.$$('.thing.comment.collapsed')).length,
            `should be some collapsed items`
          )

          const previousCollapsed = (
            await client.$$('.thing.comment.collapsed')
          ).length
          await say()

          // no collapsed comments remain
          t.true(
            (await client.$$('.thing.comment.collapsed')).length <
            previousCollapsed - 5,
            `at least 5 comments have been expanded`
          )
        },
      },
    ],
  },
}
