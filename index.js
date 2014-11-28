/**
 *
 * The Bipio Trello Pod
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
var Pod = require('bip-pod'),
https = require('https'),
querystring = require('querystring'),
Q = require('q'),

Trello = new Pod();

Trello.getParameters = function(path, query, sysImports) {
  var config = this.getConfig();

  var auth = {
    token : sysImports.auth.oauth.token,
    key : config.oauth.consumerKey
  };

  return '/1/'
  + path
  + '?'
  + querystring.stringify(auth)
  + '&'
  + querystring.stringify(query);
}

Trello.trelloRequest = function(path, params, sysImports, next, method) {
  var opts = {
    host: 'api.trello.com',
    port: 443,
    path: this.getParameters(path, params, sysImports),
    method: method || 'GET'
  };

  https.request(opts, next).end();
}

Trello.trelloRequestParsed = function(path, params, sysImports, next, method) {
  this.trelloRequest(path, params, sysImports, function(res) {
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {
      if(res.statusCode !== 200) {
        next(data);
      } else {
        next(false, JSON.parse(data));
      }
    });
  }, method);
}

Trello.rpc = function(action, method, sysImports, options, channel, req, res) {
  var podConfig = this.getConfig(),
  self = this,
  profile = JSON.parse(sysImports.auth.oauth.profile),
  opts;

  if (method == 'member_boards') {
    this.trelloRequest(
      'members/' + profile.id + '/boards',
      {},
      sysImports,
      function(tRes) {
        tRes.pipe(res);
      }
      );

  } else if (method == 'board_lists') {
    this.trelloRequest(
      'boards/' + req.query.board_id + '/lists',
      {},
      sysImports,
      function(tRes) {
        tRes.pipe(res);
      }
      );

  } else if (method == 'all_organization_members') {

    self.trelloRequestParsed(
      'members/' + profile.id + '/organizations',
      {},
      sysImports,
      function(err, orgs) {
        if (err) {
          res.send(err, 500);
          res.end();
        } else {
          var promises = [],
          orgMembers = [];

          for (var i = 0; i < orgs.length; i++) {
            deferred = Q.defer();
            promises.push(deferred.promise);
            (function(deferred, org, members) {
              self.trelloRequestParsed(
                'organizations/' + org.id + '/members',
                {},
                sysImports,
                function(err, members) {
                  if (err) {
                    deferred.reject();
                  } else {
                    for (var j = 0; j < members.length; j++) {
                      members[j].org_id = org.id;
                      members[j].org_display_name = org.displayName;
                      orgMembers.push(members[j]);
                    }
                    deferred.resolve();
                  }
                });
            })(deferred, orgs[i], orgMembers);
          }

          Q.all(promises).then(
            function() {
              res.send(orgMembers)
            },
            function(err) {
              res.send(err, 500);
            });
        }
      });

  // we don't have a schema client that can follow refs from
  // boards > lists hierarchically, so need to cheat a litte...
  } else if (method == 'all_board_lists') {

    self.trelloRequestParsed(
      'members/' + profile.id + '/boards',
      {},
      sysImports,
      function(err, boards) {
        if (err) {
          res.send(err, 500);
          res.end();
        } else {
          var promises = [],
          activeLists = [];

          for (var i = 0; i < boards.length; i++) {
            if (!boards[i].closed) {
              deferred = Q.defer();
              promises.push(deferred.promise);

              (function(deferred, board, activeLists) {
                self.trelloRequestParsed(
                  'boards/' + board.id + '/lists',
                  {},
                  sysImports,
                  function(err, lists) {
                    if (err) {
                      deferred.reject();
                    } else {
                      // augment the list name with a useful path
                      for (var i = 0; i < lists.length; i++) {
                        if (!lists[i].closed) {
                          lists[i].name_path = board.name + ' > ' + lists[i].name;
                          activeLists.push(lists[i]);
                        }
                      }
                      deferred.resolve();
                    }
                  }
                  );
              })(deferred, boards[i], activeLists);
            }
          }

          Q.all(promises).then(
            function() {
              res.send(activeLists)
            },
            function(err) {
              res.send(err, 500);
            });
        }
      }
      );


  } else {
    this.__proto__.rpc.apply(this, arguments);
  }
}

// -----------------------------------------------------------------------------
module.exports = Trello;
