// https://github.com/davidhstocker/SACWidgetWithD3/blob/master/webcomponents.js

// Event sequence:
// - constructor
// - onCustomWidgetBeforeUpdate
// - onCustomWidgetAfterUpdate
// - connectedCallback
// - onCustomWidgetResize
(function(){

        let d3Script=document.createElement('script');
        d3Script.src = 'https://d3js.org/d3.v5.min.js'
        d3Script.async = false;
        document.head.appendChild(d3Script);

        let tmpl = document.createElement('template');
        tmpl.innerHTML = `
            <style></style>
        `

        d3Script.onload = () =>

        customElements.define('sap-d3insac', class D3Widget extends HTMLElement {

            constructor(){
                super();
                this._shadowRoot = this.attachShadow({mode:'open'});
                this._shadowRoot.appendChild(tmpl.content.cloneNode(true));
                this._firstConnection = false;

                //Constants
                if(!window._d3){
                    window._d3 = d3;
                }
                this.style.height="100%";  //Beta workaround
                this._svgContainer;

                // Several properties that I left out for the moment

                // Adding event handler for click events
                this.addEventListener("click",event=>{
                    var event=new Event("onClick");
                    this.dispatchEvent(event);
                });
            }            

             //Fired when the widget is removed from the html DOM of the page (e.g. by hide)
            disconnectedCallback() {
                try{
                    document.head.removeChild(d3Script);
                }
                catch{}
            }

             //Fired when the widget is added to the html DOM of the page
            connectedCallback () {
                // Get the component size as set in the Analytics Application Designer
                const bcRect = this.getBoundingClientRect();
                this._widgetHeight = bcRect.height;
                this._widgetWidth = bcRect.width;
                // if (bcRect.height > bcRect.width){
                //     this._widgetHeight = bcRect.width;
                // }
                this._firstConnection = true;
                setTimeout(()=>{this.redraw();},1000);
            }   

             //When the custom widget is updated, the Custom Widget SDK framework executes this function first
            onCustomWidgetBeforeUpdate(oChangedProperties){

            }

            //When the custom widget is updated, the Custom Widget SDK framework executes this function after the update
            onCustomWidgetAfterUpdate(oChangedProperties){
                // this._widgetHeight = 600;
                // this._widgetHeight = 600;
                // if(this._widgetHeight > this._widgetWidth){
                //     this._widgetHeight = this._widgetWidth;
                // }
                if(this._firstConnection){
                    this.redraw();
                }
            }

            //When the custom widget is removed from the canvas or the analytic application is closed
            onCustomWidgetDestroy(){

            }

            onCustomWidgetResize(width,height){
                this._widgetHeight = width;
                this._widgetWidth = height;

                // if (this._widgetHeight < this._widgetWidth){
                //     this._widgetWidth = this._widgetHeight;
                // }
            }

            redraw(){
                if(!this._svgContainer){
                    this._svgContainer = window._d3.select(this._shadowRoot)
                        .append("svg")
                        .attr("id","planchart")
                        .attr("width",this._widgetWidth)
                        .attr("height",this._widgetHeight);
                }else{
                    window._d3.select(this._shadowRoot).selectAll("*").remove();
                    this._svgContainer = window._d3.select(this._shadowRoot)
                        .append("svg")
                        .attr("id","planchart")
                        .attr("width",this._widgetWidth)
                        .attr("height",this._widgetHeight);
                }

                this._margin = {top: 20, right: 20, bottom: 30, left: 50};

                let locHeight = this._widgetHeight;
                // let locWidth = this._widgetWidth;
                this._points = window._d3.range(0,9).map(function(i){
                    let point = {}
                    point.date = 2011 + i;
                    point.value = 50 + Math.random() * 100;
                    return point
                })

                // Convert years as integer to date format
                var timeParse = window._d3.timeParse("%Y")
                this._points.forEach(function(d){
                    d.date = timeParse(d.date)
                })

                // Scale x axis
                var x = window._d3.scaleTime()
                    .domain(window._d3.extent(this._points, d=>d.date))
                    .rangeRound([0, this._widgetWidth]);

                // Scale y axis
                var valueMax = window._d3.max(this._points,d=>d.value)
                var y = window._d3.scaleLinear()
                    .domain([0, valueMax+this._margin.top])
                    .rangeRound([this._widgetHeight, 0]);

                var xAxis = window._d3.axisBottom(x),
                    yAxis = window._d3.axisLeft(y);

                var line = window._d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.value));
                    
                this._svgContainer.append('rect')
                    .attr('class', 'zoom')
                    .attr('cursor', 'move')
                    .attr('fill', 'none')
                    .attr('pointer-events', 'all')
                    .attr('width', this._widgetWidth)
                    .attr('height', this._widgetHeight)
                    .attr('transform', 'translate(' + this._margin.left + ',' + this._margin.top + ')')

                var focus = this._svgContainer.append("g")
                                .attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");

                focus.append("path")
                    .datum(this._points)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 1.5)
                    .attr("d", line);

                // let drag = window._d3.drag()
                //     .on('start', dragstarted)
                //     .on('drag', dragged)
                //     .on('end', dragended);
                        
                var circles = focus.append("g").selectAll('circle')
                    .data(this._points)
                    .enter()
                    .append('circle')
                    .attr('r', 5.0)
                    .attr('cx', d => x(d.date))
                    .attr('cy', d => y(d.value))
                    .style('cursor', 'pointer')
                    .style('fill', 'steelblue');
                    //.call(drag);

                focus.append('g')
                    .attr('class', 'axis axis--x')
                    .attr('transform', `translate(0, ${locHeight})`)
                    .call(xAxis);
                    
                focus.append('g')
                    .attr('class', 'axis axis--y')
                    .call(yAxis);

            }



        });

})();