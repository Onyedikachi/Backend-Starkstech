const mongoose = require('mongoose');

const AttachmentSchema = mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, reßquired: true },
    fileType: { type: String, required: true },
    todo: {
      type: mongoose.Schema.ObjectId,
      ref: 'ToDos',
      required: true,
    },
  });

const ToDoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide task name'],
      maxlength: [100, 'Name can not be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide task description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    attachments: [AttachmentSchema],
    accomplished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);


module.exports = mongoose.model('ToDos', ToDoSchema);
