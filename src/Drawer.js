import React, { useEffect } from 'react';
import { CupertinoPane } from 'cupertino-pane';
import { FixedSizeList as List } from 'react-window';

const Post = ({ index, style, data }) => (
  <div style={style}>
    <div id={`p${index + 1}`}>
      {data[index]}
    </div>
  </div>
);

let drawer;

function Drawer({ buttonData = [], onFlyToButtonClick, posts = [] }) {
  
  useEffect(() => {
    
    const topHeight = 600;
    const middleHeight = 300;
    const content = document.querySelector('ion-drawer .content');

    drawer = new CupertinoPane('ion-drawer', {
      breaks: {
        top: { enabled: true, height: topHeight },
        middle: { enabled: true, height: middleHeight },
        bottom: { enabled: true, offset: 90 },
      },
      handleKeyboard: false,
      initialBreak: 'top',
      buttonDestroy: true,
      fastSwipeClose: true,
      dragBy: ['.draggable', 'ion-drawer h1'],
      events: {
        onDrag: () => {
          const height = drawer.getHeight();
          content.style.height = `${height - content.offsetTop}px`;
          content.setAttribute('style', 'overflow-y: hidden !important');
        },
        onDidPresent: () => {
          content.setAttribute('style', 'overflow-y: auto !important');
          content.style.height = `${middleHeight - content.offsetTop}px`;
        },
        onTransitionEnd: () => {
          setTimeout(() => {
            setHeight();
          }, 200);
        },
      },
    });

    function setHeight() {
      content.setAttribute('style', 'overflow-y: auto !important');
      if (drawer.currentBreak() === 'top') {
        content.style.height = `${topHeight - content.offsetTop}px`;
      }
      if (drawer.currentBreak() === 'middle') {
        content.style.height = `${middleHeight - content.offsetTop}px`;
      }
    }

    function getPaneTransformY() {
      const translateYRegex = /\.*translateY\((.*)px\)/i;
      const paneEl = document.querySelector('.pane');
      return paneEl ? parseFloat(translateYRegex.exec(paneEl.style.transform)[1]) : 0;
    }

    async function presentDrawer() {
      drawer.present({ animate: true });
    }

    async function destroyDrawer() {
      drawer.destroy({ animate: true });
    }

    async function hideDrawer() {
      drawer.hide();
    }

    async function isHiddenDrawer() {
      console.log(await drawer.isHidden());
    }

    async function setTopDrawer() {
      drawer.moveToBreak('top');
    }

    async function setMiddleDrawer() {
      drawer.moveToBreak('middle');
    }

    async function setBottomDrawer() {
      drawer.moveToBreak('bottom');
    }

    async function presentTop() {
      presentDrawer();
      setTopDrawer();
    }


    }, []);


  return (
    <ion-drawer>
      <h1 id="location" className="ion-padding">
        Heinosities
      </h1>
      {buttonData.length > 0 ? (
        <div id="button-group" className="py-2 pl-4 flex justify-left items-center space-x-4 overflow-x-auto">
          <h2 className="flex-shrink-0">Associated: </h2>
          <div id="tags" className="flex-shrink-0">
          {buttonData.map((button, index) => (
            <button
              key={index}
              type="button"
              data-latitude={button.latitude}
              data-longitude={button.longitude}
              data-description={button.description}
              className="flex-shrink-0 bg-yellow-500 py-2 px-4 mx-2 rounded-full"
              onClick={onFlyToButtonClick}
            >
              {button.label}
            </button>
          ))}
        </div>
        </div>
      ) : null}
      <div className="content" overflow-y="auto">
      <List
            height={posts.length*750} // adjust based on your layout
            itemCount={posts.length}
            itemSize={750} // adjust based on your layout
        >
            {({ index, style }) => {
                const post = posts[index];
                return (
                    <div id={`p${index+1}`} style={style} dangerouslySetInnerHTML={{ __html: post }}>
                    </div>
                );
            }}
        </List>
    </div>
    </ion-drawer>
  );
}

export default Drawer;
export function presentDrawer() {
    drawer.present({ animate: true });
  }
export function destroyDrawer() {
    drawer.destroy({ animate: true });
}

  
