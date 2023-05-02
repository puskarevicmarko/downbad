import React, { useEffect } from 'react';
import { CupertinoPane, CupertinoSettings } from 'cupertino-pane';

let drawer;

function Drawer({  buttonData = [], onFlyToButtonClick }) {

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
      initialBreak: 'top',
      buttonDestroy: false,
      fastSwipeClose: true,
      dragBy: ['.draggable', 'ion-drawer h1'],
      events: {
        onDrag: () => {
          content.style.height = `${window.screen.height - getPaneTransformY() - content.offsetTop}px`;
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
      <div className="content" overflow-y>
        <div id="p1"></div>
        <div id="p2"></div>
        <div id="p3"></div>
        <div id="p4"></div>
        <div id="p5"></div>
        <div id="p6"></div>
        <div id="p7"></div>
        <div id="p8"></div>
        <div id="p9"></div>
        <div id="p10"></div>
        <div id="p11"></div>
        <div id="p12"></div>
        <div id="p13"></div>
        <div id="p14"></div>
        <div id="p15"></div>
        <div id="p16"></div>
        <div id="p17"></div>
        <div id="p18"></div>
        <div id="p19"></div>
        <div id="p20"></div>
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

  
