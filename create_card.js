/**
 *
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function CreateCard() {}

CreateCard.prototype = {};

CreateCard.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var pod = this.pod;

  var opts = {
    name : imports.name,
    desc : imports.description,
    idList : imports.default_list_id
  }

  if (imports.position) {
    opts.pos = imports.position;
  }

  if (imports.assigned_member_ids) {
    if (this.$resource.helper.isArray(imports.assigned_member_ids)) {
      opts.idMembers = imports.assigned_member_ids.join(',');
    } else {
      opts.idMembers = imports.assigned_member_ids;
    }
  }

  if (imports.due) {
    opts.due = imports.due;
  }

  var label = imports.label;
  if (label && 'none' !== label.toLowerCase().trim()) {
    opts.labels = label;
  }

  pod.trelloRequestParsed(
    'cards',
    opts ,
    sysImports,
    function(err, data) {
      next(err, data);
    },
    'POST'
  );

}

// -----------------------------------------------------------------------------
module.exports = CreateCard;
