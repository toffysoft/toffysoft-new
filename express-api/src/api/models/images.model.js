const mongoose = require("mongoose")
const _ = require("lodash")
const Schema = mongoose.Schema

const imagesSchema = new Schema({
  urls: {
    type: Array,
    required: true,
    index: true
  },
  created: {
    type: Date,
    index: true
  },
  updated: {
    type: Date,
    index: true
  }
})

imagesSchema.pre("save", function(next) {
  const utc = new Date()
  const now = utc.setHours(utc.getHours() + 7) // Set Time to Bangkok time

  this.updated = now

  if (!this.created) {
    this.created = now
  }

  next()
})

// imagesSchema.method({
//   transform() {
//     const transformed = {}
//     const fields = ["id", "urls"]

//     fields.forEach(field => {
//       transformed[field] = this[field] || ""
//     })

//     return transformed
//   }
// })

// imagesSchema.statics = {
//   // list({ page = 1, perpage = 5, id, sort = { id: "created", desc: true } }) {
//   //   page = parseInt(page)
//   //   perpage = parseInt(perpage)

//   //   const options = _.omitBy({ _id: id }, _.isNil)

//   //   let sortOption = {}
//   //   sortOption[sort["id"]] = JSON.parse(sort["desc"]) === true ? -1 : 1

//   //   return this.find(options)
//   //     .sort(sortOption)
//   //     .skip(perpage * (page - 1))
//   //     .limit(perpage)
//   //     .exec()
//   // },
//   deleteOne(id) {
//     return this.findOneAndDelete({ _id: id })
//   },
//   deleteMulti(id_Array) {
//     return this.deleteMany({ _id: { $in: id_Array } })
//   },
//   totaldatacount({ id }) {
//     const options = _.omitBy({ _id: id }, _.isNil)

//     return this.find(options)
//       .countDocuments()
//       .exec()
//   }
// }

module.exports = mongoose.model("Images", imagesSchema)
