/**
 *
 * The Bipio Trello Pod
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
var Pod = require('bip-pod'),
https = require('https'),
querystring = require('querystring'),
Q = require('q'),

Trello = new Pod();

Trello.profileReprOAuth = function(profile) {
  return profile.fullName;
}

Trello.getParameters = function(path, query, sysImports) {
  var config = this.getConfig();

  var auth = {
    token : sysImports.auth.oauth.access_token,
    key : sysImports.auth.oauth.consumerKey
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
  uid = (sysImports.auth.oauth.user_id || JSON.parse(sysImports.auth.oauth.profile).id),
  opts;

  if (method == 'member_boards') {
    this.trelloRequest(
      'members/' + uid + '/boards',
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
      'members/' + uid + '/organizations',
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
      'members/' + uid + '/boards',
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
