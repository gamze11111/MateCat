/**
 * React Component for the warnings.

 */
var React = require('react');
var ReactDOM = require('react-dom');
const escapeStringRegexp = require('escape-string-regexp');

class TagsMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.menuHeight = 300;
        this.tagsRefs = {};
        let missingTags = this.getMissingTags();
        let uniqueSourceTags = TagsMenu.arrayUnique(this.props.sourceTags);
        let addedTags = _.filter(uniqueSourceTags, function ( item ) {
            return missingTags.indexOf(item.replace(/&quot;/g, '"')) === -1 ;
        });
        this.state = {
            selectedItem: 0,
            missingTags : missingTags,
            addedTags : addedTags,
            totalTags : missingTags.concat(addedTags),
            filteredTags: [],
            filter: "",
            coord : this.getSelectionCoords()
        };
        this.handleKeydownFunction = this.handleKeydownFunction.bind(this);
        this.handleResizeEvent = this.handleResizeEvent.bind(this);
    }

    static arrayUnique(a) {
        return a.reduce(function(p, c) {
            if (p.indexOf(c) < 0) p.push(c);
            return p;
        }, []);
    };

    getSelectionCoords() {
        var win = window;
        var doc = win.document;
        var sel = doc.selection, range, rects, rect;
        var x = 0, y = 0;
        if (win.getSelection) {
            sel = win.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();

                var span = doc.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild( doc.createTextNode( "\u200b" ) );
                    range.insertNode( span );
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.bottom;
                    var spanParent = span.parentNode;
                    spanParent.removeChild( span );

                    // Glue any broken text nodes back together
                    spanParent.normalize();

                }
            }
        }
        if ( (window.innerHeight - y) < (this.menuHeight + 200) ) {
            y = y - this.menuHeight - 20;
        }
        return { x: x, y: y };
    }

    getMissingTags() {
        var sourceClone = $( '.source', UI.currentSegment ).clone();
        //Remove inside-attribute for ph with equiv-text tags
        sourceClone.find('.locked.inside-attribute').remove();
        var sourceTags = sourceClone.html()
            .match( /(&lt;\s*\/*\s*(g|x|bx|ex|bpt|ept|ph|it|mrk)\s*.*?&gt;)/gi );
        //get target tags from the segment
        var targetClone =  $( '.targetarea', UI.currentSegment ).clone();
        //Remove from the target the tags with mismatch
        // targetClone.find('.locked.mismatch').remove();

        var newhtml = targetClone.html();
        //Remove inside-attribute for ph with equiv-text tags
        targetClone.find('.locked.inside-attribute').remove();

        var targetTags = targetClone.html()
            .match( /(&lt;\s*\/*\s*(g|x|bx|ex|bpt|ept|ph|it|mrk)\s*.*?&gt;)/gi );

        if(targetTags == null ) {
            targetTags = [];
        } else {
            targetTags = targetTags.map(function(elem) {
                return elem.replace(/<\/span>/gi, "").replace(/<span.*?>/gi, "");
            });
        }
        var missingTags = sourceTags.map(function(elem) {
            return elem.replace(/<\/span>/gi, "").replace(/<span.*?>/gi, "");
        });
        //remove from source tags all the tags in target segment
        for(var i = 0; i < targetTags.length; i++ ){
            var pos = missingTags.indexOf(targetTags[i]);
            if( pos > -1){
                missingTags.splice(pos,1);
            }
        }
        return missingTags;
    }

    getItemsMenuHtml() {
        let menuItems = [];
        let missingItems = [];
        let addedItems = [];
        let textDecoded;
        let tagIndex = 0;
        if ( this.state.missingTags.length > 0 ) {
            missingItems.push(<div className="head-tag-list missing"> Missing source <span
                className="style-tag mismatch">tags</span> in the target </div>
            );
            _.each(this.state.missingTags, (item, index) => {
                if (this.state.filter !== "" && this.state.totalTags.indexOf(item) === -1) {
                    return;
                }
                let textDecoded = UI.transformTextForLockTags(item);
                let label = textDecoded.indexOf('inside-attribute') !== -1 ? $(textDecoded).find('.inside-attribute').html() : $(textDecoded).html();
                if (this.state.filter !== "") {
                    label = label.replace(htmlEncode(this.state.filter), "<mark>" + htmlEncode(this.state.filter) + "</mark>");
                } else {
                    textDecoded = UI.transformTextForLockTags(item);
                }

                let classSelected = (this.state.selectedItem === tagIndex) ? "active" : "";
                let indexTag = _.clone(tagIndex);
                missingItems.push(<div className={"item missing-tag " + classSelected}
                                       key={"missing" + _.clone(tagIndex)}
                                       data-original="item"
                                       dangerouslySetInnerHTML={this.allowHTML(label)}
                                       onClick={this.selectTag.bind(this, textDecoded)}
                                       ref={(elem) => {
                                           this.tagsRefs["item" + indexTag] = elem;
                                       }}
                    />
                );
                tagIndex++;
            });
        }
        if ( this.state.addedTags.length > 0 ) {
            addedItems.push(<div className="head-tag-list added"> Added <span className="style-tag">tags</span> in the target</div>);
            _.each(this.state.addedTags, ( item, index ) => {

                if ( this.state.filter !== "" && this.state.totalTags.indexOf(item) === -1 ) {
                    return;
                }
                let textDecoded = UI.transformTextForLockTags(item);
                let label = textDecoded.indexOf('inside-attribute') !== -1 ? $(textDecoded).find('.inside-attribute').html() : $(textDecoded).html();
                if ( this.state.filter !== "" ) {
                    label = label.replace(htmlEncode(this.state.filter), "<mark>" + htmlEncode(this.state.filter) + "</mark>");
                } else {
                    textDecoded = UI.transformTextForLockTags(item);
                }

                let classSelected = ( this.state.selectedItem === tagIndex ) ? "active" : "";
                let indexTag = _.clone(tagIndex);
                addedItems.push(<div className={"item added-tag " + classSelected} key={"missing"+ _.clone(tagIndex)} data-original="item"
                                    dangerouslySetInnerHTML={ this.allowHTML(label) }
                                    onClick={this.selectTag.bind(this, textDecoded)}
                                    ref={(elem)=>{this.tagsRefs["item" + indexTag]=elem;}}
                    />
                );
                tagIndex++;
            });
        }

        if ( missingItems.length <= 1 && addedItems.length <= 1 ) {
            menuItems.push(<div className={"item added-tag no-results"} key={0} data-original="item">No results</div> );
            return <div className="ui vertical menu">
                <div>
                {menuItems}
                </div>
            </div>;
        }
        return <div className="ui vertical menu">
            {missingItems.length > 1 &&
            <div>
                {missingItems}
            </div>
            }
            {addedItems.length > 1 &&
            <div>
                {addedItems}
            </div>
            }
        </div>;
    }


    openTagAutocompletePanel() {

        if ($('.selected', UI.editarea).length) {
            let range =  window.getSelection().getRangeAt(0);
            setCursorAfterNode(range, $('.selected', UI.editarea)[0]);
        }
        var endCursor = document.createElement("span");
        endCursor.setAttribute('class', 'tag-autocomplete-endcursor');
        insertNodeAtCursor(endCursor);

    }

    chooseTagAutocompleteOption(tag) {
        setCursorPosition($(".tag-autocomplete-endcursor", UI.editarea)[0]);
        saveSelection();
        // Todo: refactor this part
        let editareaClone = UI.editarea.clone();
        if ($('.selected', $(editareaClone)).length) {
            if ( $('.selected', $(editareaClone)).hasClass('inside-attribute') ) {
                $('.selected', $(editareaClone)).parent('span.locked').remove();
            } else {
                $('.selected', $(editareaClone)).remove();
            }
        }
        let regeExp = this.state.filter !== "" && new RegExp('(' + escapeStringRegexp(htmlEncode(this.state.filter)) +')?(<span class="tag-autocomplete-endcursor">)', 'gi');
        let regStartTarget = new RegExp('(<span class="tag-autocomplete-endcursor"><\/span>)(<span.*?<\\/span>)(&lt;)+'+ htmlEncode(this.state.filter), 'gi');

        editareaClone.find('.rangySelectionBoundary').before(editareaClone.find('.rangySelectionBoundary + .tag-autocomplete-endcursor'));
        editareaClone.find('.tag-autocomplete-endcursor').after(editareaClone.find('.tag-autocomplete-endcursor').html());
        editareaClone.find('.tag-autocomplete-endcursor').html('');

        editareaClone.html(editareaClone.html().replace(regStartTarget, '$2$3$1'));
        this.state.filter !== "" && editareaClone.html(editareaClone.html().replace(regeExp, '$2'));

        editareaClone.html(editareaClone.html().replace(/&lt;(?:[a-z]*(?:&nbsp;)*["<\->\w\s\/=]*)?(<span class="tag-autocomplete-endcursor">)/gi, '$1'));
        editareaClone.html(editareaClone.html().replace(/&lt;(?:[a-z]*(?:&nbsp;)*["\w\s\/=]*)?(<span class="tag-autocomplete-endcursor"\>)/gi, '$1'));
        editareaClone.html(editareaClone.html().replace(/&lt;(?:[a-z]*(?:&nbsp;)*["\w\s\/=]*)?(<span class="undoCursorPlaceholder monad" contenteditable="false"><\/span><span class="tag-autocomplete-endcursor"\>)/gi, '$1'));
        editareaClone.html(editareaClone.html().replace(/(<span class="tag-autocomplete-endcursor"\><\/span><span class="undoCursorPlaceholder monad" contenteditable="false"><\/span>)&lt;/gi, '$1'));
        editareaClone.html(editareaClone.html().replace(/(<span class="tag-autocomplete-endcursor"\>.+<\/span><span class="undoCursorPlaceholder monad" contenteditable="false"><\/span>)&lt;/gi, '$1'));

        var ph = "";
        if($('.rangySelectionBoundary', editareaClone).length) { // click, not keypress
            ph = $('.rangySelectionBoundary', editareaClone)[0].outerHTML;
        }

        $('.rangySelectionBoundary', editareaClone).remove();
        $('.tag-autocomplete-endcursor', editareaClone).after(ph);
        $('.tag-autocomplete-endcursor', editareaClone).before(tag.trim()); //Trim to remove space at the end
        $('.tag-autocomplete, .tag-autocomplete-endcursor', editareaClone).remove();

        //Close menu
        SegmentActions.closeTagsMenu();
        $('.tag-autocomplete-endcursor').remove();

        SegmentActions.replaceEditAreaTextContent(UI.getSegmentId(UI.currentSegment), UI.getSegmentFileId(UI.currentSegment), editareaClone.html());
        setTimeout(function () {
            restoreSelection();
        });
        setTimeout(function () {
            UI.segmentQA(UI.currentSegment);
            UI.checkTagProximity();
        });

    }

    selectTag(tag) {
        this.chooseTagAutocompleteOption(tag);
    }

    allowHTML(string) {
        return { __html: string };
    }

    handleKeydownFunction( event) {
        if ( event.key === 'Enter' ) {
            event.preventDefault();
            let tag = this.state.totalTags[this.state.selectedItem];
            if ( !_.isUndefined(tag) ) {
                tag = UI.transformTextForLockTags(tag);
                this.selectTag(tag)
            }
        } else if ( event.key ===  'Escape' ) {
            event.preventDefault();
            //Close menu
            SegmentActions.closeTagsMenu();
            $('.tag-autocomplete-endcursor').remove();
        } else if ( event.key ===  'ArrowUp' ) {
            event.preventDefault();
            this.setState({
                selectedItem: this.getNextIdx("prev")
            });
        } else if ( event.key ===  'ArrowDown' ) {
            event.preventDefault();
            this.setState({
                selectedItem: this.getNextIdx("next")
            });
        } else if ( event.key ===  'Backspace' ) {
            this.state.filter.length > 0 && this.filterTags(event.key);
            this.state.filter.length === 0 && SegmentActions.closeTagsMenu();
        } else if (event.code === "Space" || event.keyCode >= 48 && event.keyCode <= 90 ||
            event.keyCode >= 96 && event.keyCode <= 111 ||
            event.keyCode >= 186 && event.keyCode <=222){
            this.filterTags(event.key);
        }
    }

    filterTags(newCharacter) {
        let filter;
        let tags;
        if (newCharacter === " " && this.state.filter === "" ) {
            return;
        }

        if ( newCharacter === 'Backspace' ) {
            filter = this.state.filter.substring(0, this.state.filter.length-1);
            tags = this.state.missingTags.concat(this.state.addedTags);
        } else {
            filter = this.state.filter + newCharacter;
            tags = _.clone(this.state.totalTags);
        }
        let filteredTags = _.filter(tags, (tag)=>{
            if ( tag.indexOf('equiv-text') > -1 ) {
                let tagHtml = UI.transformTextForLockTags(tag);
                return $(tagHtml).find('.inside-attribute').text().indexOf(filter) !== -1;
            } else {
                return htmlDecode( tag ).indexOf( filter ) !== -1;
            }
        });

        this.setState({
            selectedItem: 0,
            totalTags : filteredTags,
            filter: filter
        });
    }

    handleResizeEvent( event ) {
        let sel = window.getSelection();
        if ( $(sel.focusNode).closest('.editarea').length > 0 ) {
            let coord = this.getSelectionCoords();
            this.setState({
                coord
            })
        }
    }

    getNextIdx(direction) {
        let idx = this.state.selectedItem;
        let length = this.state.totalTags.length;
        switch (direction) {
            case 'next': return (idx + 1) % length;
            case 'prev': return (idx === 0) && length - 1 || idx - 1;
            default:     return idx;
        }
    }


    componentDidMount() {
        document.addEventListener("keydown", this.handleKeydownFunction);
        window.addEventListener("resize", this.handleResizeEvent);
        $("#outer").on("scroll", this.handleResizeEvent);
        this.openTagAutocompletePanel();
        UI.tagMenuOpen = true;
    }

    componentWillUnmount() {
        document.removeEventListener( "keydown", this.handleKeydownFunction );
        window.removeEventListener( "resize", this.handleResizeEvent );
        $("#outer").off("scroll", this.handleResizeEvent);
        $('.tag-autocomplete-endcursor').remove();
        UI.tagMenuOpen = false;
    }

    componentDidUpdate(prevProps, prevState) {
        // only scroll into view if the active item changed last render
        if (this.state.selectedItem !== prevState.selectedItem) {
            this.ensureActiveItemVisible();
        }
    }

    ensureActiveItemVisible() {
        var itemComponent = this.tagsRefs['item'+this.state.selectedItem];
        if (itemComponent) {
            var domNode = ReactDOM.findDOMNode(itemComponent);
            this.scrollElementIntoViewIfNeeded(domNode);
        }
    }

    scrollElementIntoViewIfNeeded(domNode) {
        var containerDomNode = ReactDOM.findDOMNode( this.menu );
        $(containerDomNode).animate({
            scrollTop: $(domNode)[0].offsetTop - 60
        }, 150);
    }

    render() {

        let style = {
            position: "fixed",
            zIndex: 2,
            maxHeight: "30%",
            overflowY: "auto",
            top: this.state.coord.y,
            left: this.state.coord.x
        };

        let tags = this.getItemsMenuHtml();
        return <div className="tags-auto-complete-menu" style={style}
                    ref={(menu)=>{this.menu=menu;}}>
                    {tags}
        </div>;
    }
}

export default TagsMenu;

