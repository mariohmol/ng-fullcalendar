import {
  Component, Input, Output, OnInit, NgZone, AfterViewInit,
  AfterContentChecked, AfterViewChecked, ElementRef, EventEmitter
} from '@angular/core';

// bug on rolluup https://github.com/rollup/rollup/issues/1267#issuecomment-296395734
import * as jqueryProxy from 'jquery';
const $: JQueryStatic = (<any>jqueryProxy).default || jqueryProxy;

// import * as $ from 'jquery';
import 'fullcalendar';
// import { OptionsInputBase } from 'fullcalendar/src/types/input-types';
import './lib/customEvent';
import { ButtonClickModel } from './models/buttonClickModel';
import { UpdateEventModel } from './models/updateEventModel';
import { RenderEventModel } from './models/renderEventModel';
import { OptionsInputBase, EventObjectInput, EventSourceFunction, EventSourceExtendedInput } 
from 'fullcalendar/src/types/input-types';
export interface Options extends OptionsInputBase {
  resourceRender?: Function;
}
@Component({
  selector: 'ng-fullcalendar',
  template: '',
})
export class CalendarComponent implements OnInit, AfterViewInit, AfterContentChecked, AfterViewChecked {
  private _eventsModel: string | EventObjectInput[] | EventSourceFunction | EventSourceExtendedInput | undefined;
  private _reRender = true;
  get eventsModel(): string | EventObjectInput[] | EventSourceFunction | EventSourceExtendedInput | undefined {
    return this._eventsModel;
  }

  @Input('eventsModel')
  set eventsModel(value: string | EventObjectInput[] | EventSourceFunction | EventSourceExtendedInput | undefined) {
    this._eventsModel = value;
    if (this._reRender) {
      setTimeout(() => {
        this.renderEvents(value);
      }, 50);
    } else {
      this._reRender = true;
    }
  }
  // Notify when things change
  @Output() eventsModelChange = new EventEmitter<any>();

  // Options object, see fullcalendar docs
  @Input() options: Options; // OptionsInputBase;

  // Various events
  @Output() eventDrop = new EventEmitter<any>();
  @Output() eventResize = new EventEmitter<any>();
  @Output() eventResizeStart = new EventEmitter<any>();
  @Output() eventResizeStop = new EventEmitter<any>();
  @Output() eventClick = new EventEmitter<any>();
  @Output() clickButton = new EventEmitter<any>();
  @Output() windowResize = new EventEmitter<any>();
  @Output() viewRender = new EventEmitter<any>();
  @Output() eventAfterRender = new EventEmitter<any>();
  @Output() eventAfterAllRender = new EventEmitter<any>();
  @Output() viewDestroy = new EventEmitter<any>();
  @Output() eventRender = new EventEmitter<any>();
  @Output() eventDestroy = new EventEmitter<any>();
  @Output() eventMouseOver = new EventEmitter<any>();
  @Output() eventMouseOut = new EventEmitter<any>();
  @Output() initialized = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();
  @Output() unselect = new EventEmitter<any>();
  @Output() dayClick = new EventEmitter<any>();
  @Output() navLinkDayClick = new EventEmitter<any>();
  @Output() navLinkWeekClick = new EventEmitter<any>();
  @Output() eventDragStart = new EventEmitter<any>();
  @Output() eventDragStop = new EventEmitter<any>();
  @Output() drop = new EventEmitter<any>();
  @Output() eventReceive = new EventEmitter<any>();
  @Output() dayRender = new EventEmitter<any>();
  @Output() resourceRender = new EventEmitter<any>();


  constructor(private element: ElementRef, private zone: NgZone) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updaterOptions();
      this.zone.runOutsideAngular(() => {

        this.getElement().fullCalendar(this.options);
        this._eventsModel = this.options.events;
        this.eventsModelChange.next(this.options.events);
        this.initialized.emit(true);
        // Click listeners
        let elem = document.getElementsByTagName('ng-fullcalendar');

        $('[class ^="fc"][class *="button"]').click(el => {
          let classnames = el.currentTarget.className.split(' ');
          classnames.forEach(name => {
            if (name.indexOf('button') == name.length - 6) {
              name = name.replace(/fc|button|-/g, '');
              if (name != '') {
                // this.renderEvents(this._eventsModel);
                eventDispatch(name);
              }
            }
          });
        });
        function eventDispatch(buttonType: string) {
          let data = $('ng-fullcalendar').fullCalendar('getDate');
          let currentDetail: ButtonClickModel = {
            buttonType: buttonType,
            data: data
          };
          const widgetEvent = new CustomEvent('clickButton', {
            bubbles: true,
            detail: currentDetail
          });
          for (let i = 0; i < elem.length; i++) {
            elem[i].dispatchEvent(widgetEvent);
          }
        }
      });
    });

  }
  ngAfterContentChecked() {
  }
  ngAfterViewChecked() {
  }
  updateEventsBeforeResize() {
    let events = this.fullCalendar('clientEvents');
    this._reRender = false;
    this.eventsModel = events;
    this.eventsModelChange.next(events);
  }
  updaterOptions() {
    let elem = document.getElementsByTagName('ng-fullcalendar');
    this.options.eventDrop = (event: EventObjectInput, duration: any, revertFunc: Function) => {
      let detail: any = { event: event, duration: duration, revertFunc: revertFunc };
      let widgetEvent = new CustomEvent('eventDrop', {
        bubbles: true,
        detail: detail
      });
      this.updateEventsBeforeResize();
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.eventResize = (event: EventObjectInput, duration: any, revertFunc: Function) => {
      let detail: UpdateEventModel = { event: event, duration: duration, revertFunc: revertFunc };
      let widgetEvent = new CustomEvent('eventResize', {
        bubbles: true,
        detail: detail
      });
      this.updateEventsBeforeResize();
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.eventResizeStart = (event: any, jsEvent: any, ui: any, view: any) => {
      let detail: any = {
        event: event, jsEvent: jsEvent, ui: ui, view: view
      };
      const widgetEvent = new CustomEvent('eventResizeStart', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventResizeStop = (event: any, jsEvent: any, ui: any, view: any) => {
      let detail: any = {
        event: event, jsEvent: jsEvent, ui: ui, view: view
      };
      const widgetEvent = new CustomEvent('eventResizeStop', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventRender = function (event: any, element: any, view: any) {
      let detail: RenderEventModel = { event: event, element: element, view: view };
      const widgetEvent = new CustomEvent('eventRender', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.eventDestroy = (event: any, element: any, view: any) => {
      let detail = { event: event, element: element, view: view };
      const widgetEvent = new CustomEvent('eventDestroy', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventAfterRender = (event: any, element: any, view: any) => {
      let detail: RenderEventModel = { event: event, element: element, view: view };
      const widgetEvent = new CustomEvent('eventAfterRender', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventClick = (event: any, jsEvent: any, view: any) => {
      let detail: any = { event: event, duration: null, jsEvent: jsEvent, view: view };
      const widgetEvent = new CustomEvent('eventClick', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }

    };
    this.options.windowResize = function (view: any) {
      let detail = { view: view };
      const widgetEvent = new CustomEvent('windowResize', {
        bubbles: true,
        detail: detail
      });
      if (elem && elem[0]) {
        for (let i = 0; i < elem.length; i++) {
          elem[i].dispatchEvent(widgetEvent);
        }
      }
    };
    this.options.viewRender = function (view: any, element: any) {
      let detail = { view: view, element: element };
      const widgetEvent = new CustomEvent('viewRender', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.viewDestroy = function (view: any, element: any) {
      let detail = { view: view, element: element };
      const widgetEvent = new CustomEvent('viewDestroy', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.select = function (start: any, end: any, jsEvent: MouseEvent, view: any, resource?: any) {
      let detail = { start: start, end: end, jsEvent: jsEvent, view: view, resource: resource };
      const widgetEvent = new CustomEvent('select', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.unselect = function (view: any, jsEvent: Event) {
      let detail = { view: view, jsEvent: jsEvent };
      const widgetEvent = new CustomEvent('unselect', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.dayClick = function (date: any, jsEvent: Event, view: any) {
      let detail = { date: date, jsEvent: jsEvent, view: view };
      const widgetEvent = new CustomEvent('dayClick', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.navLinkDayClick = function (date: any, jsEvent: Event) {
      let detail = { date: date, jsEvent: jsEvent };
      const widgetEvent = new CustomEvent('navLinkDayClick', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.navLinkWeekClick = function (weekStart: any, jsEvent: Event) {
      let detail = { weekStart: weekStart, jsEvent: jsEvent };
      const widgetEvent = new CustomEvent('navLinkWeekClick', {
        bubbles: true,
        detail: detail
      });
      for (let i = 0; i < elem.length; i++) {
        elem[i].dispatchEvent(widgetEvent);
      }
    };
    this.options.eventDragStart = (event: any, jsEvent: Event, ui: any, view: any) => {
      let detail = { event: event, jsEvent: jsEvent, ui: ui, view: view };
      const widgetEvent = new CustomEvent('eventDragStart', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventDragStop = (event: any, jsEvent: Event, ui: any, view: any) => {
      let detail = { event: event, jsEvent: jsEvent, ui: ui, view: view };
      const widgetEvent = new CustomEvent('eventDragStop', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventMouseover = (event: any, jsEvent: Event, view: any) => {
      let detail = { event: event, jsEvent: jsEvent, view: view };
      const widgetEvent = new CustomEvent('eventMouseOver', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventMouseout = (event: any, jsEvent: Event, view: any) => {
      let detail = { event: event, jsEvent: jsEvent, view: view };
      const widgetEvent = new CustomEvent('eventMouseOut', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.drop = (date: any, jsEvent: Event, ui: any, resourceId?: any) => {
      let detail = { date: date, jsEvent: jsEvent, ui: ui, resourceId: resourceId };
      const widgetEvent = new CustomEvent('drop', {
        bubbles: true,
        detail: detail
      });
      // probably need to add an event - not handled!
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.eventReceive = (event: any) => {
      let detail = { event: event };
      const widgetEvent = new CustomEvent('eventReceive', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.dayRender = (date: any, cell: any) => {
      let detail = { date: date, cell: cell };
      const widgetEvent = new CustomEvent('dayRender', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
    this.options.resourceRender = (resourceObj: any, labelTds: any, bodyTds: any) => {
      let detail = { resourceObj: resourceObj, labelTds: labelTds, bodyTds: bodyTds };
      const widgetEvent = new CustomEvent('resourceRender', {
        bubbles: true,
        detail: detail
      });
      elem[0].dispatchEvent(widgetEvent);
    };
  }

  fullCalendar(...args: any[]): any {
    if (!args) {
      return;
    }
    switch (args.length) {
      case 0:
        return;
      case 1:
        return this.getElement().fullCalendar(args[0]);
      case 2:
        return this.getElement().fullCalendar(args[0], args[1]);
      case 3:
        return this.getElement().fullCalendar(args[0], args[1], args[2]);
    }
  }

  updateEvent(event: any) {
    return this.getElement().fullCalendar('updateEvent', event);
  }

  clientEvents(idOrFilter: any): any {
    return this.getElement().fullCalendar('clientEvents', idOrFilter);
  }
  renderEvents(events: string | EventObjectInput[] | EventSourceFunction | EventSourceExtendedInput | undefined) {
    this.getElement().fullCalendar('removeEvents');
    const arrayEvents = (<EventObjectInput[]>events);
    if (arrayEvents && arrayEvents.length > 0) {
      this.getElement().fullCalendar('renderEvents', arrayEvents, true);
      this.getElement().fullCalendar('rerenderEvents');
    }
  }

  getElement() {
    const byElement = $(this.element.nativeElement);
    if (byElement) {
      return byElement;
    }
    if (!this.element.nativeElement.id) {
      this.element.nativeElement.id = 'ngfullcalendar' + new Date().getTime();
    }
    return $('#' + this.element.nativeElement.id);
  }

}
