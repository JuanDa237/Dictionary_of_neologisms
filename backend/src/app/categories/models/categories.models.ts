import { Schema, model, Document } from "mongoose";

const categorySchema: Schema = new Schema({
    name: String
});

export interface Category extends Document {
    name: string;
}

export default model<Category>('category', categorySchema);