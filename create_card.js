/**
 *
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2014 Michael Pearson https://github.com/mjpearson
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

function CreateCard() {}

CreateCard.prototype = {};

CreateCard.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var pod = this.pod;

  var opts = {
    name : imports.name,
    desc : imports.description,
    idList : imports.idList || imports.default_list_id
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
