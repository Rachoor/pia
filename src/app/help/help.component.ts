import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit, OnDestroy {
  public tableOfTitles = [];
  public content;
  private currentAnchorId: string
  public activeElement: string;
  private helpSubscription: Subscription;
  public pdfSrc: string = '/pdf-test.pdf';
  public displayInfografics: boolean;

  constructor(private http: HttpClient,
              private _translateService: TranslateService) {}

  ngOnInit() {
    const language = this._translateService.currentLang;
    // let fileTranslation = language  === 'fr' ? 'fr' : 'en' ;
    let fileTranslation = language;
    let file = `./assets/files/pia_help_${fileTranslation}.html`;

    this.http.get(file, { responseType: 'text' }).subscribe(data => {
      this.content = data;
      this.getSectionList();
    });

    this.helpSubscription = this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // fileTranslation = event['lang'] === 'fr' ? 'fr' : 'en';
      fileTranslation = event['lang'];
      file = `./assets/files/pia_help_${fileTranslation}.html`;
      this.http.get(file, { responseType: 'text' }).subscribe(data => {
        this.content = data;
        this.getSectionList();
      });
    });

    window.onscroll = function(ev) {
      if (window.innerWidth > 640) {
        const el: any = document.querySelector('.pia-help-section');
        if (el) {
          if (window.scrollY >= 100) {
            el.setAttribute('style', 'width:283px;');
            el.classList.add('pia-help-section-scroll');
          } else {
            el.setAttribute('style', 'width:auto;');
            el.classList.remove('pia-help-section-scroll');
          }
        }
      }
    };
  }

  ngOnDestroy() {
    this.helpSubscription.unsubscribe();
  }

  /**
   * Jump to the title/subtitle clicked.
   * @param {any} event - Any Event.
   * @param {any} text - The title or subtitle.
   * @memberof HelpComponent
   */
  getAnchor(event, text) {
    event.preventDefault();
    this.activeElement = text;
    const allSubtitles = document.querySelectorAll('h3');
    [].forEach.call(allSubtitles, (el, i) => {
      if (el.innerText === this.activeElement) {
        el.scrollIntoView();
      }
    });
  }

  /**
   * Parse the file to get all title and subtitle.
   * @memberof HelpComponent
   */
  getSectionList() {
    this.tableOfTitles = [];
    const lines = this.content.split('\n');
    let tt = [];
    lines.forEach((line) => {
      line = line.trim();
      if (line.startsWith('<h3>')) {
        tt[1].push(line.replace(/<(\/?)h3>/g, '').trim());
      } else if (line.startsWith('<h2>')) {
        if (tt.length > 0) {
          this.tableOfTitles.push(tt);
        }
        tt = [line.replace(/<(\/?)h2>/g, '').trim(), []];
      }
    });
    if (tt.length > 0) {
      this.tableOfTitles.push(tt);
    }
  }

  printPdf() {
    var data = document.getElementById('infografics_file');
    var blob : any;

    this.http.get(data.textContent, { responseType: 'arraybuffer' } )
      .subscribe((file: ArrayBuffer) => {
        var mediaType = 'application/pdf';
        var blob = new Blob([file], {type: mediaType});
        var filename = 'Infografics DPIA.pdf';
        const a = <any>document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        const event = new MouseEvent('click', {
          view: window
        });
        a.dispatchEvent(event);
      });
  }

  /**
   * Display or hide the Infografics.
   * @memberof HelpComponent
   */
  toggleInfograficsContent(el) {
    var el2 = document.getElementById('infografics_file');
    var el3 = document.getElementById('infografics_display');
    var el4 = document.getElementById('infografics_hide');

    this.pdfSrc = el2.textContent;
    this.displayInfografics = !this.displayInfografics;

    if (el.value == "false") {
      el.textContent = el3.textContent;
      el.value = "true";
    } else {
      el.textContent = el4.textContent;
      el.value = "false";
    }
  }
}
