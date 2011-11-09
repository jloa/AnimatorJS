/*
 * Animator.js v0.2a
 * https://github.com/jloa/AnimatorJS
 *
 * Copyright 2011, Julius Loa, Jloa
 * Licensed under the MIT http://www.opensource.org/licenses/mit-license.php
 * >> http://www.w3.org/TR/css3-animations/
 */
(function(window){
	/*************************************************************
	 * browser
	 */
	var browser = (function(){
    		var ua = navigator.userAgent;
    		var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    		return {
      		ie: !!window.attachEvent && !isOpera,
     		opera: isOpera,
      		webkit: ua.indexOf('AppleWebKit/') > -1,
      		gecko: ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
     		mobileSafari: /Apple.*Mobile/.test(ua)
   		}
	})();
	window.browser = browser;
	
	/*************************************************************
	 * animator
	 */
	var animator = {
		/** version holder */
		version:'0.2a',
		/**
		 * Animates the target element according to defined params
		 * @param	element:HTMLElement			target element to be animated @see http://api.jquery.com/category/selectors/
		 * @param	delay:number				animation delay in seconds @example <code>3.2 is 3.2 seconds</code>
		 * @param	duration:number				animation duration in seconds @example <code>3.2 is 3.2 seconds</code>
		 * @param	iterations:string			animation iteration count: number | 'infinite'
		 * @param	direction:string			animation direction values: 'normal' | 'alternate'
		 * @param	timingFunc:string			animation easeing function to use: ease | linear | ease-in | ease-out | ease-in-out | cubic-bezier(<n>, <n>, <n>, <n>)
		 * @param	frames:Array				array of keyframes for the animation @example [ 'top:200px;', 'top:30px; transform:rotate(145deg);', 'top:560px;' ]
		 * @param	stopOnLastFrame:Boolean		whether the animation should stop on the last keyframe when finished or not @default true
		 */
		animate:function(element, delay, duration, iterations, direction, timingFunc, frames, stopOnLastFrame, onFinish)
		{
			// correct
			frames = (frames == undefined) ? [] : frames;
			// correct & default
			stopOnLastFrame = (stopOnLastFrame == undefined) ? true : stopOnLastFrame;
			// we can't make a zero-framed animation
			var numFr = frames.length; if(numFr == 0) return;
			// genarate the animation name as {id}_animation 
			var animName = element.attr("id").replace(/\W/gi, '')+'_animation';
			// get the required prefix according to the browser
			var prefix = this.getPrefix();
			// record the old style
			var oldStyle = element.attr('style'); oldStyle = (oldStyle == undefined) ? '' : oldStyle;
			// generate the required styles array
			var aniStyles = this.genAnimationStyles(prefix, animName, duration, delay, iterations, direction, timingFunc);
			// generate the required css rule with the keyframes
			var aniCSS = this.genAnimationCSS(prefix, animName, frames);
			
			// pass all styles to the target element.style prop
			for(var i = 0, n = aniStyles.length; i < n; ++i)
				element.css(aniStyles[i].prop, aniStyles[i].val);
			
			if(onFinish != undefined)
				element.data('on-finish', onFinish);
			
			// if 'stopOnLastFrame' is enabled => record the end props and update the style when 'animationend' triggers
			element.data('end-props', (stopOnLastFrame) ? frames[numFr-1] : oldStyle);
			element.unbind('webkitAnimationEnd animationend');
			element.bind('webkitAnimationEnd animationend', function() {
				$(this).attr('style', $(this).data('end-props'));
				if($(this).data('on-finish'))
					$(this).data('on-finish')(this);
			});
			
			// record styles & css rule for further accessibility
			element.data('animation-styles', aniStyles);	
			element.data('animation-css', aniCSS);	
			
			// add the keyframes css rule
			var sheet = document.styleSheets[0];
			if(sheet.insertRule) sheet.insertRule(aniCSS.selector+'{'+aniCSS.style+'}', 0);
			if(sheet.addRule) 	 sheet.addRule(aniCSS.selector, aniCSS.style);
		},
		/**
		 * Pauses the target element's animation
		 * @param	element:HTMLElement		target element to be pused @see http://api.jquery.com/category/selectors/
		 */
		pause:function(element)
		{
			element.css(this.getPrefix()+'animation-play-state', 'paused');
		},
		/**
		 * Resumes the target element's animation
		 * @param	element:HTMLElement		target element to be pused @see http://api.jquery.com/category/selectors/
		 */
		resume:function(element)
		{
			element.css(this.getPrefix()+'animation-play-state', 'running');
		},
		/**
		 * Checks whether the target element is in pause state
		 * @param	element:HTMLElement		target element to be pused @see http://api.jquery.com/category/selectors/
		 */
		isPaused:function(element)
		{
			return element.css(this.getPrefix()+'animation-play-state') == 'paused';
		},
		/**
		 * @private Returns an array of requred style for the animation
		 */
		genAnimationStyles:function(prefix, animName, duration, delay, iterations, direction, timingFunc)
		{
			var styles = [];
			styles.push({ prop: prefix+'animation-name', val: animName });
			styles.push({ prop: prefix+'animation-duration', val: duration+'s' });
			styles.push({ prop: prefix+'animation-delay', val: delay+'s' });
			styles.push({ prop: prefix+'animation-iteration-count', val: iterations });
			styles.push({ prop: prefix+'animation-direction', val: direction });
			styles.push({ prop: prefix+'animation-timing-function', val: timingFunc });
			styles.push({ prop: prefix+'animation-play-state', val: 'running' });
			return styles;
		},
		/**
		 * @private Returns keyframes css rule
		 */
		genAnimationCSS:function(prefix, animName, frames)
		{
			var selector = '@'+prefix+'keyframes '+animName;
			var style = '';
			for(var i = 0, n = frames.length; i < n; ++i)
			{
				// if transforms are defined, make them cross-browser
				frames[i] = frames[i].replace(/transform/, prefix+'transform');
				// write the next frame
				style += Math.round(i/(n-1)*100)+'% {'+frames[i]+'}';
			}
			
			return { selector: selector, style: style };
		},
		/**
		 * @private Returns the proper prefix according to the browser
		 */
		getPrefix:function()
		{
			if(browser.ie) return '-ms-';
			if(browser.gecko) return '-moz-';
			if(browser.webkit || browser.mobileSafari) return '-webkit-';
			return '';
		}
	};
	window.animator = window.$animator = animator;	// ez reference
})(window);											// run