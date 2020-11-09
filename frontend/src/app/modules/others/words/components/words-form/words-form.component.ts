import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Category } from '@modules/others/categories/models';
import { CategoriesService } from '@modules/others/categories/services';

import { WordsService } from '../../services';
import { Word } from '../../models';

@Component({
	selector: 'app-words-form',
	templateUrl: './words-form.component.html',
	styleUrls: ['./words-form.component.scss']
})
export class WordsFormComponent implements OnInit {
	public wordForm: FormGroup;

	@Output()
	private onSubmitEvent: EventEmitter<null>;

	@Output()
	private creatingForm: EventEmitter<boolean>;

	@Output()
	private invalidForm: EventEmitter<boolean>;

	public creating: boolean;
	public categories: Category[];

	public preview: string;

	constructor(
		private wordsService: WordsService,
		private categoriesService: CategoriesService,
		private activatedRoute: ActivatedRoute
	) {
		this.wordForm = new FormGroup({
			_id: new FormControl(null),
			idCategory: new FormControl(null, Validators.required),
			word: new FormControl(null, [
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(30)
			]),
			definition: new FormControl(null),
			visible: new FormControl(false),
			conceptVideo: new FormControl(null),
			meaningVideo: new FormControl(null)
		});

		this.onSubmitEvent = new EventEmitter<null>();
		this.creatingForm = new EventEmitter<boolean>();
		this.invalidForm = new EventEmitter<boolean>();

		this.creating = true;
		this.categories = new Array<Category>(0);
		this.preview = '';
	}

	ngOnInit(): void {
		this.wordForm.valueChanges.subscribe(() => {
			this.invalidForm.emit(this.wordForm.invalid);
		});

		this.getUrlParams();
		this.getCategories();
	}

	//Private methods
	private getUrlParams(): void {
		const id: string = this.activatedRoute.snapshot.params.id;
		this.creating = id == null;

		this.creatingForm.emit(this.creating);

		if (!this.creating) {
			this.wordsService.getWord(id).subscribe(
				(response) => {
					this.setWordValues(response);
				},
				(error) => {
					throw new Error(error);
				}
			);
		}
	}

	private getCategories(): void {
		this.categoriesService.getCategories().subscribe(
			(response) => {
				this.categories = response;
			},
			(error) => {
				throw new Error(error);
			}
		);
	}

	//Component methods
	public submitEvent(): void {
		if (this.wordForm.valid) this.onSubmitEvent.emit(null);
	}

	//Public methods
	public getWordValues(): Word {
		return this.wordForm.value as Word;
	}

	public setWordValues(word: Word): void {
		this.wordForm.patchValue({
			_id: word._id,
			idCategory: word.idCategory,
			word: word.word,
			definition: word.definition,
			conceptVideo: word.conceptVideo,
			meaningVideo: word.meaningVideo,
			visible: word.visible
		});
	}

	// Html methods

	public onFileChange(event: any, input: string): void {
		const file: File = (event.target as HTMLInputElement).files[0];

		const extencion: string = '.' + file.name.split('.').pop();

		if (extencion.match(/\.(mp4|mov|ogv|webm)$/)) {
			console.log(input, extencion, file);

			this.wordForm.patchValue({
				input: file
			});
		} else {
			// Error
		}
	}
}