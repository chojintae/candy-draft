import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { create, empty_everything, load_processed_picks_and_drafters, load_selecting_box, select_a_pick } from './routes';


describe('routes', function() {
  it('create, load, and pick', function() {

  /**
   * 1st TEST:
   * Examine the draft ID
   */
    const req1 = httpMocks.createRequest({method: 'POST', url: '/api/create', 
                                          body: {
                                            "rounds": 2,
                                            "list_of_picks_in_array": ["book", "pencil", "note", "laptop"],
                                            "list_of_drafters_in_array": ["A", "B"]
                                          }
    })

    const res1 = httpMocks.createResponse();
    create(req1, res1)
    assert.strictEqual(res1._getStatusCode(), 200);

    assert.deepEqual(res1._getJSONData(), {draftID: 1}); 


    /**
     * 2st TEST.
     * Again, examine the draft ID
     */
    const req2 = httpMocks.createRequest({method: 'POST', url: '/api/create', 
                                          body: {
                                            "rounds": 2,
                                            "list_of_picks_in_array": ["book", "pencil", "note", "laptop"],
                                            "list_of_drafters_in_array": ["A", "B"]
                                          }
    })

    const res2 = httpMocks.createResponse();
    create(req2, res2)
    assert.strictEqual(res2._getStatusCode(), 200);

    assert.deepEqual(res2._getJSONData(), {draftID: 2}); 

    /**
     * 3rd TEST.
     * Again, examine the draft ID, with the different input
     */
    const req3 = httpMocks.createRequest({method: 'POST', url: '/api/create', 
                                          body: {
                                            "rounds": 1,
                                            "list_of_picks_in_array": ["note", "laptop"],
                                            "list_of_drafters_in_array": ["A", "B"]
                                          }
    })

    const res3 = httpMocks.createResponse();
    create(req3, res3)
    assert.strictEqual(res3._getStatusCode(), 200);

    assert.deepEqual(res3._getJSONData(), {draftID: 3}); 

    empty_everything()


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 4st TEST
     * Check if the options (picks) are stored well
     */
    
    const req4 = httpMocks.createRequest({method: 'POST', url: '/api/create', 
                                          body: {
                                            "rounds": 2,
                                            "list_of_picks_in_array": ["book", "pencil", "note", "laptop"],
                                            "list_of_drafters_in_array": ["A", "B"]
                                          }
    })

    const res4 = httpMocks.createResponse();
    create(req4, res4) // now, the things above are stored.

    // now, load the selecting box.
    // it would be great if I can check the lists as well, but well, I don't have a function that loads the unprocessed lists.

    const reqID1 = httpMocks.createRequest({method: 'POST', url: '/api/load_selecting_box', 
                                            body: {
                                              "draftID": 1
                                            }
                                          })

    const resLoad_selecting_box1 = httpMocks.createResponse();
    load_selecting_box(reqID1, resLoad_selecting_box1)

    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepEqual(resLoad_selecting_box1._getJSONData(), {not_yet_processed_picks: ["book", "pencil", "note", "laptop"]})

    // Now, delete one

    const req4_that_includes_selected_pick = httpMocks.createRequest({method: 'POST', url: '/api/select_a_pick', 
                                            body: {
                                              "draftID": 1,
                                              "selected_pick": "book",
                                              "userName": "A"
                                            }
                                          })

    const res5 = httpMocks.createResponse();
    select_a_pick(req4_that_includes_selected_pick, res5)

    assert.strictEqual(res4._getStatusCode(), 200);

    // Now that that pick is deleted, let's see if the storage contains the rest.

    const reqID1_again = httpMocks.createRequest({method: 'POST', url: '/api/load_selecting_box', 
                                            body: {
                                              "draftID": 1
                                            }
                                          })

    const resLoad_selecting_box2 = httpMocks.createResponse();
    load_selecting_box(reqID1_again, resLoad_selecting_box2)

    assert.strictEqual(resLoad_selecting_box2._getStatusCode(), 200);
    assert.deepEqual(resLoad_selecting_box2._getJSONData(), {not_yet_processed_picks: ["pencil", "note", "laptop"]})

    // Now, test load_processed_picks_and_drafters. Since I've deleted one element above, 
    // I should see it and its drafter. The client wants [string, string][].
    
    const reqID1_again_again = httpMocks.createRequest({method: 'POST', url: '/api/load_processed_picks_and_drafters', 
                                            body: {
                                              "draftID": 1
                                            }
                                          })

    const resload_processed_picks_and_drafters = httpMocks.createResponse();
    load_processed_picks_and_drafters(reqID1_again_again, resload_processed_picks_and_drafters)

    assert.strictEqual(resload_processed_picks_and_drafters._getStatusCode(), 200);
    assert.deepEqual(resload_processed_picks_and_drafters._getJSONData(), {processed_picks_and_drafters: [["book", "A"]] });


    /**
     * 5th TEST
     * Check if the options (picks) are stored well
     */
    
    const req6 = httpMocks.createRequest({method: 'POST', url: '/api/create', 
                                          body: {
                                            "rounds": 1,
                                            "list_of_picks_in_array": ["note", "laptop"],
                                            "list_of_drafters_in_array": ["A", "B"]
                                          }
    })

    const res6 = httpMocks.createResponse();
    create(req6, res6) // now, the things above are stored.

    // now, load the selecting box.
    // ID should be 2 here.

    const reqID2 = httpMocks.createRequest({method: 'POST', url: '/api/load_selecting_box', 
                                            body: {
                                              "draftID": 2
                                            }
                                          })

    const resLoad_selecting_box3 = httpMocks.createResponse();
    load_selecting_box(reqID2, resLoad_selecting_box3)

    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepEqual(resLoad_selecting_box3._getJSONData(), {not_yet_processed_picks: ["note", "laptop"]})

    // Now, delete one

    const req6_that_includes_selected_pick = httpMocks.createRequest({method: 'POST', url: '/api/select_a_pick', 
                                            body: {
                                              "draftID": 2,
                                              "selected_pick": "note",
                                              "userName": "A"
                                            }
                                          })

    const res7 = httpMocks.createResponse();
    select_a_pick(req6_that_includes_selected_pick, res7)

    assert.strictEqual(res4._getStatusCode(), 200);

    // Now that that pick is deleted, let's see if the storage contains the rest.

    const reqID2_again = httpMocks.createRequest({method: 'POST', url: '/api/load_selecting_box', 
                                            body: {
                                              "draftID": 2
                                            }
                                          })

    const resLoad_selecting_box4 = httpMocks.createResponse();
    load_selecting_box(reqID2_again, resLoad_selecting_box4)

    assert.strictEqual(resLoad_selecting_box4._getStatusCode(), 200);
    assert.deepEqual(resLoad_selecting_box4._getJSONData(), {not_yet_processed_picks: ["laptop"]})

    // Now, test load_processed_picks_and_drafters. Since I've deleted one element above, 
    // I should see it and its drafter. The client wants [string, string][].
    
    const reqID2_again_again = httpMocks.createRequest({method: 'POST', url: '/api/load_processed_picks_and_drafters', 
                                            body: {
                                              "draftID": 2
                                            }
                                          })

    const resload_processed_picks_and_drafters2 = httpMocks.createResponse();
    load_processed_picks_and_drafters(reqID2_again_again, resload_processed_picks_and_drafters2)

    assert.strictEqual(resload_processed_picks_and_drafters2._getStatusCode(), 200);
    assert.deepEqual(resload_processed_picks_and_drafters2._getJSONData(), {processed_picks_and_drafters: [["note", "A"]] });

  })
  



});

