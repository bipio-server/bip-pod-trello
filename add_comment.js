/**
 *
 *
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2014 CloudSpark pty ltd http://www.cloudspark.com.au
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function AddComment(podConfig) {
  this.name = 'add_comment';
  this.description = 'Add A Comment',
  this.description_long = 'Adds a Comment to a Card',
  this.trigger = false;
  this.singleton = false;
  this.auto = false;
  this.podConfig = podConfig;
}

AddComment.prototype = {};

AddComment.prototype.getSchema = function() {
  return {
    "imports": {
      "properties" : {
        "card_id" : {
          "type" :  "string",
          "description" : "Card ID"
        },
        "text" : {
          "type" :  "string",
          "description" : "Comment Text"
        }
      }
    },
    "exports": {
      "properties" : {
        "id" : {
          "type" : "string",
          "description" : "CommentID"
        }
      }
    }    
  }
}

AddComment.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var pod = this.pod;
  if (imports.text) {
    pod.trelloRequestParsed(
      'cards/' + imports.card_id + '/actions/comments',
      {
        text : imports.text
      },
      sysImports,
      function(err, data) {
        next(err, data);        
      },
      'POST'
    );
  }
}

// -----------------------------------------------------------------------------
module.exports = AddComment;
